import { useState, useEffect } from 'react'

interface Item {
  id: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  type: 'material' | 'crafted' | 'special'
  quantity: number
  image: string
}

interface Recipe {
  id: string
  name: string
  description: string
  materials: { id: string; quantity: number }[]
  result: { id: string; quantity: number }
  unlocked: boolean
}

export default function TradeCraft() {
  const [inventory, setInventory] = useState<Item[]>([
    {
      id: 'petal_common',
      name: 'Common Petal',
      description: 'A basic cherry blossom petal',
      rarity: 'common',
      type: 'material',
      quantity: 10,
      image: '🌸'
    },
    {
      id: 'petal_rare',
      name: 'Rare Petal',
      description: 'A shimmering cherry blossom petal',
      rarity: 'rare',
      type: 'material',
      quantity: 3,
      image: '✨'
    },
    {
      id: 'petal_epic',
      name: 'Epic Petal',
      description: 'A magical cherry blossom petal',
      rarity: 'epic',
      type: 'material',
      quantity: 1,
      image: '🌟'
    }
  ])

  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: 'petal_crown',
      name: 'Petal Crown',
      description: 'A beautiful crown made of cherry blossoms',
      materials: [
        { id: 'petal_common', quantity: 5 },
        { id: 'petal_rare', quantity: 2 }
      ],
      result: { id: 'petal_crown', quantity: 1 },
      unlocked: true
    },
    {
      id: 'magical_wand',
      name: 'Magical Wand',
      description: 'A wand that enhances your petal collection',
      materials: [
        { id: 'petal_rare', quantity: 3 },
        { id: 'petal_epic', quantity: 1 }
      ],
      result: { id: 'magical_wand', quantity: 1 },
      unlocked: false
    }
  ])

  const [activeTab, setActiveTab] = useState<'inventory' | 'crafting' | 'trading'>('inventory')
  const [showNotification, setShowNotification] = useState<string | null>(null)

  useEffect(() => {
    // Load inventory and recipes from localStorage
    const savedInventory = localStorage.getItem('inventory')
    const savedRecipes = localStorage.getItem('recipes')
    if (savedInventory) setInventory(JSON.parse(savedInventory))
    if (savedRecipes) setRecipes(JSON.parse(savedRecipes))
  }, [])

  useEffect(() => {
    // Save inventory and recipes to localStorage
    localStorage.setItem('inventory', JSON.stringify(inventory))
    localStorage.setItem('recipes', JSON.stringify(recipes))
  }, [inventory, recipes])

  const craftItem = (recipe: Recipe) => {
    // Check if we have enough materials
    const canCraft = recipe.materials.every(material => {
      const inventoryItem = inventory.find(item => item.id === material.id)
      return inventoryItem && inventoryItem.quantity >= material.quantity
    })

    if (!canCraft) {
      setShowNotification('Not enough materials!')
      setTimeout(() => setShowNotification(null), 3000)
      return
    }

    // Remove materials
    const updatedInventory = inventory.map(item => {
      const material = recipe.materials.find(m => m.id === item.id)
      if (material) {
        return { ...item, quantity: item.quantity - material.quantity }
      }
      return item
    })

    // Add crafted item
    const resultItem = updatedInventory.find(item => item.id === recipe.result.id)
    if (resultItem) {
      setInventory(updatedInventory.map(item =>
        item.id === recipe.result.id
          ? { ...item, quantity: item.quantity + recipe.result.quantity }
          : item
      ))
    } else {
      setInventory([...updatedInventory, {
        id: recipe.result.id,
        name: recipe.name,
        description: recipe.description,
        rarity: 'epic',
        type: 'crafted',
        quantity: recipe.result.quantity,
        image: '🎨'
      }])
    }

    setShowNotification('Item crafted successfully!')
    setTimeout(() => setShowNotification(null), 3000)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {(['inventory', 'crafting', 'trading'] as const).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-bold shadow-glow transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-400/40'
                : 'bg-black/60 text-pink-300 hover:bg-pink-500/20'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-xl shadow-lg animate-bounce drop-shadow-glow">
          {showNotification}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-black/60 border-2 border-pink-900 shadow-glow flex flex-col items-center text-center"
            >
              <div className="text-4xl font-extrabold drop-shadow-glow animate-glow select-none mb-2">
                {item.image === '🌸' ? '✦' : item.image === '✨' ? '꧁𝔂𝓪𝓼𝓼꧂' : item.image === '🌟' ? '( • )( • )' : item.image}
              </div>
              <h3 className={`text-xl font-bold ${getRarityColor(item.rarity)} drop-shadow-glow animate-glow`}>{item.name}</h3>
              <p className="text-pink-200 text-sm mb-2 italic">{item.description}</p>
              <div className="text-pink-300 font-bold">Quantity: {item.quantity}</div>
            </div>
          ))}
        </div>
      )}

      {/* Crafting Tab */}
      {activeTab === 'crafting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className={`p-4 rounded-xl border-2 shadow-glow transition-all duration-300 flex flex-col items-center text-center ${
                recipe.unlocked
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-400 shadow-pink-400/40'
                  : 'bg-black/60 border-pink-900'
              }`}
            >
              <h3 className="text-xl font-bold text-pink-400 drop-shadow-glow animate-glow mb-2">{recipe.name}</h3>
              <p className="text-pink-200 text-sm mb-4 italic">{recipe.description}</p>
              <div className="mb-4 w-full">
                <h4 className="text-pink-300 mb-2 font-bold">Materials Required:</h4>
                {recipe.materials.map(material => {
                  const inventoryItem = inventory.find(item => item.id === material.id)
                  const hasEnough = inventoryItem && inventoryItem.quantity >= material.quantity
                  return (
                    <div key={material.id} className="flex items-center gap-2 mb-1 justify-center">
                      <span className={hasEnough ? 'text-pink-200 font-bold' : 'text-red-400 font-bold'}>
                        {inventoryItem?.image === '🌸' ? '✦' : inventoryItem?.image === '✨' ? '꧁𝔂𝓪𝓼𝓼꧂' : inventoryItem?.image === '🌟' ? '( • )( • )' : inventoryItem?.image} {material.quantity}x
                      </span>
                      <span className="text-pink-300">
                        ({inventoryItem?.quantity || 0} available)
                      </span>
                    </div>
                  )
                })}
              </div>
              <button
                className={`w-full py-2 rounded-lg font-bold shadow-glow transition-all animate-glow ${
                  recipe.unlocked
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                    : 'bg-gray-600 cursor-not-allowed text-gray-300'
                }`}
                onClick={() => recipe.unlocked && craftItem(recipe)}
                disabled={!recipe.unlocked}
              >
                {recipe.unlocked ? 'Craft' : 'Locked'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Trading Tab */}
      {activeTab === 'trading' && (
        <div className="text-center text-pink-300 animate-glow">
          <p className="text-xl mb-4 font-bold">Trading system coming soon!</p>
          <p className="text-sm italic">Trade with other players and exchange your crafted items.</p>
        </div>
      )}
      <style jsx>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px #ff2ab8cc) drop-shadow(0 0 2px #fff3);
        }
        .shadow-glow {
          box-shadow: 0 0 16px 2px #ff2ab8cc, 0 0 2px #fff3;
        }
        @keyframes glow {
          0% { text-shadow: 0 0 8px #ff2ab8, 0 0 2px #fff3; }
          50% { text-shadow: 0 0 16px #ff2ab8, 0 0 4px #fff6; }
          100% { text-shadow: 0 0 8px #ff2ab8, 0 0 2px #fff3; }
        }
        .animate-glow {
          animation: glow 2s infinite alternate;
        }
      `}</style>
    </div>
  )
} 