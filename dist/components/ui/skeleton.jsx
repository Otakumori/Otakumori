'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Skeleton = Skeleton;
const utils_1 = require('@/lib/utils');
function Skeleton({ className, ...props }) {
  return (
    <div className={(0, utils_1.cn)('bg-muted animate-pulse rounded-md', className)} {...props} />
  );
}
