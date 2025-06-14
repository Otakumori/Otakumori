-- Function to get current database connections
CREATE OR REPLACE FUNCTION get_db_connections()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    connection_count integer;
BEGIN
    SELECT count(*) INTO connection_count
    FROM pg_stat_activity
    WHERE datname = current_database();
    
    RETURN connection_count;
END;
$$;

-- Function to get table information
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (
    table_name text,
    row_count bigint,
    size_bytes bigint,
    last_analyzed timestamp
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.table_name::text,
        (SELECT count(*) FROM information_schema.tables WHERE table_name = t.table_name)::bigint as row_count,
        pg_total_relation_size(t.table_name::regclass)::bigint as size_bytes,
        (SELECT last_analyze FROM pg_stat_user_tables WHERE relname = t.table_name) as last_analyzed
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    ORDER BY t.table_name;
END;
$$;

-- Function to get index information
CREATE OR REPLACE FUNCTION get_indexes()
RETURNS TABLE (
    table_name text,
    index_name text,
    index_size_bytes bigint,
    index_scan_count bigint,
    last_used timestamp
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.relname::text as table_name,
        i.relname::text as index_name,
        pg_relation_size(i.oid)::bigint as index_size_bytes,
        s.idx_scan::bigint as index_scan_count,
        s.last_idx_scan as last_used
    FROM pg_class t
    JOIN pg_index x ON t.oid = x.indrelid
    JOIN pg_class i ON i.oid = x.indexrelid
    LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = i.oid
    WHERE t.relkind = 'r'
    ORDER BY t.relname, i.relname;
END;
$$;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE (
    table_name text,
    total_rows bigint,
    dead_rows bigint,
    live_rows bigint,
    last_vacuum timestamp,
    last_autovacuum timestamp,
    last_analyze timestamp,
    last_autoanalyze timestamp
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        relname::text as table_name,
        n_live_tup::bigint as total_rows,
        n_dead_tup::bigint as dead_rows,
        n_live_tup::bigint as live_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
    FROM pg_stat_user_tables
    ORDER BY relname;
END;
$$;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE (
    table_name text,
    index_name text,
    index_scans bigint,
    index_tuples_read bigint,
    index_tuples_fetched bigint,
    index_size_bytes bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.relname::text as table_name,
        i.relname::text as index_name,
        s.idx_scan::bigint as index_scans,
        s.idx_tup_read::bigint as index_tuples_read,
        s.idx_tup_fetch::bigint as index_tuples_fetched,
        pg_relation_size(i.oid)::bigint as index_size_bytes
    FROM pg_class t
    JOIN pg_index x ON t.oid = x.indrelid
    JOIN pg_class i ON i.oid = x.indexrelid
    LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = i.oid
    WHERE t.relkind = 'r'
    ORDER BY t.relname, i.relname;
END;
$$;

-- Function to get query statistics
CREATE OR REPLACE FUNCTION get_query_stats()
RETURNS TABLE (
    query text,
    calls bigint,
    total_time double precision,
    min_time double precision,
    max_time double precision,
    mean_time double precision,
    stddev_time double precision,
    rows bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        query::text,
        calls::bigint,
        total_time::double precision,
        min_time::double precision,
        max_time::double precision,
        mean_time::double precision,
        stddev_time::double precision,
        rows::bigint
    FROM pg_stat_statements
    ORDER BY total_time DESC
    LIMIT 100;
END;
$$;

-- Function to analyze a table
CREATE OR REPLACE FUNCTION analyze_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE format('ANALYZE %I', table_name);
END;
$$;

-- Function to vacuum a table
CREATE OR REPLACE FUNCTION vacuum_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE format('VACUUM ANALYZE %I', table_name);
END;
$$;

-- Function to reindex a table
CREATE OR REPLACE FUNCTION reindex_table(table_name text, index_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE format('REINDEX INDEX %I', index_name);
END;
$$;

-- Function to get database size
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    size_bytes bigint;
BEGIN
    SELECT pg_database_size(current_database()) INTO size_bytes;
    RETURN size_bytes;
END;
$$;

-- Function to get table bloat information
CREATE OR REPLACE FUNCTION get_table_bloat()
RETURNS TABLE (
    table_name text,
    bloat_ratio numeric,
    bloat_size_bytes bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH constants AS (
        SELECT current_setting('block_size')::numeric AS bs,
               23 AS hdr,
               4 AS ma
    ), bloat_info AS (
        SELECT
            ma,bs,schemaname,tablename,
            (datawidth+(hdr+ma-(case when hdr%ma=0 THEN ma ELSE hdr%ma END)))::numeric AS datahdr,
            (maxfracsum*(nullhdr+ma-(case when nullhdr%ma=0 THEN ma ELSE nullhdr%ma END))) AS nullhdr2
        FROM (
            SELECT
                schemaname, tablename, hdr, ma, bs,
                SUM((1-null_frac)*avg_width) AS datawidth,
                MAX(null_frac) AS maxfracsum,
                hdr+(
                    SELECT 1+count(*)/8
                    FROM pg_stats s2
                    WHERE null_frac<>0 AND s2.schemaname = s.schemaname AND s2.tablename = s.tablename
                ) AS nullhdr
            FROM pg_stats s, constants
            GROUP BY 1,2,3,4,5
        ) AS foo
    ), table_bloat AS (
        SELECT
            schemaname, tablename, cc.relpages, bs,
            CEIL((cc.reltuples*((datahdr+ma-
                (CASE WHEN datahdr%ma=0 THEN ma ELSE datahdr%ma END))+nullhdr2+4))/(bs-20::float)) AS otta
        FROM bloat_info
        JOIN pg_class cc ON cc.relname = bloat_info.tablename
        JOIN pg_namespace nn ON cc.relnamespace = nn.oid AND nn.nspname = bloat_info.schemaname
        WHERE cc.relkind = 'r'
    )
    SELECT
        tablename::text as table_name,
        ROUND(CASE WHEN otta=0 THEN 0.0 ELSE table_bloat.relpages::numeric/otta END,1) as bloat_ratio,
        (CASE WHEN otta=0 THEN 0 ELSE (table_bloat.relpages-otta)*bs END)::bigint as bloat_size_bytes
    FROM table_bloat
    WHERE (CASE WHEN otta=0 THEN 0 ELSE table_bloat.relpages-otta END) > 0
    ORDER BY bloat_size_bytes DESC;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_db_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION get_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_usage_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_query_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_table(text) TO authenticated;
GRANT EXECUTE ON FUNCTION vacuum_table(text) TO authenticated;
GRANT EXECUTE ON FUNCTION reindex_table(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_size() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_bloat() TO authenticated; 