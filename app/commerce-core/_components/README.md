# Commerce Core Internal Components

This folder intentionally holds lightweight Commerce Core support components while the public route entrypoints live under `app/(commerce-core)/commerce-core`.

Files in `_components` do not create public routes. They must not import the global site shell, Navbar, CartProvider, Clerk hooks, petals, games, community, 3D, or particle systems.
