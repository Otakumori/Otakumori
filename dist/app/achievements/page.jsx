'use strict';
'use client';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = AchievementsPage;
const react_1 = __importStar(require('react'));
const AchievementHeader_1 = require('@/app/components/achievements/AchievementHeader');
const AchievementStats_1 = require('@/app/components/achievements/AchievementStats');
const AchievementSearch_1 = require('@/app/components/achievements/AchievementSearch');
const AchievementFilters_1 = require('@/app/components/achievements/AchievementFilters');
const AchievementSort_1 = require('@/app/components/achievements/AchievementSort');
const AchievementCategories_1 = require('@/app/components/achievements/AchievementCategories');
const AchievementList_1 = require('@/app/components/achievements/AchievementList');
const AchievementContext_1 = require('@/app/contexts/AchievementContext');
function AchievementsPage() {
  const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
  const [selectedCategory, setSelectedCategory] = (0, react_1.useState)(null);
  const [showUnlocked, setShowUnlocked] = (0, react_1.useState)(true);
  const [showLocked, setShowLocked] = (0, react_1.useState)(true);
  const [showHidden, setShowHidden] = (0, react_1.useState)(false);
  const [sortBy, setSortBy] = (0, react_1.useState)('name');
  const { achievements } = (0, AchievementContext_1.useAchievements)();
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || achievement.category === selectedCategory;
    const matchesUnlocked = showUnlocked && achievement.isUnlocked;
    const matchesLocked = showLocked && !achievement.isUnlocked;
    const matchesHidden = showHidden && achievement.isHidden;
    return matchesSearch && matchesCategory && (matchesUnlocked || matchesLocked || matchesHidden);
  });
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        if (!a.unlockedAt) return 1;
        if (!b.unlockedAt) return -1;
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      case 'category':
        return a.category.localeCompare(b.category);
      case 'progress':
        const progressA = a.isUnlocked ? 100 : (a.progress / a.target) * 100;
        const progressB = b.isUnlocked ? 100 : (b.progress / b.target) * 100;
        return progressB - progressA;
      default:
        return 0;
    }
  });
  return (
    <div className="container mx-auto px-4 py-8">
      <AchievementHeader_1.AchievementHeader />
      <AchievementStats_1.AchievementStats />
      <AchievementSearch_1.AchievementSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <AchievementFilters_1.AchievementFilters
        showUnlocked={showUnlocked}
        showLocked={showLocked}
        showHidden={showHidden}
        onToggleUnlocked={() => setShowUnlocked(!showUnlocked)}
        onToggleLocked={() => setShowLocked(!showLocked)}
        onToggleHidden={() => setShowHidden(!showHidden)}
      />
      <AchievementSort_1.AchievementSort sortBy={sortBy} onSortChange={setSortBy} />
      <AchievementCategories_1.AchievementCategories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <AchievementList_1.AchievementList achievements={sortedAchievements} />
    </div>
  );
}
