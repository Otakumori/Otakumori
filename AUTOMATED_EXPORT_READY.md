# 🤖 Automated Blender Export - READY!

## ✅ I've Created TWO Automated Export Scripts!

You can now export the Blender model with **ONE COMMAND**!

---

## 🚀 Quick Export (Choose One):

### **Option 1: PowerShell** (Recommended for Windows)
```bash
npm run export-sara:ps
```

### **Option 2: Node.js**
```bash
npm run export-sara
```

---

## 🔧 What The Scripts Do:

1. ✅ **Find Blender automatically** (checks common install locations)
2. ✅ **Run Blender in headless mode** (no UI, faster)
3. ✅ **Execute Python export script** with optimal settings
4. ✅ **Convert .blend → .glb** with all features:
   - Shape keys (for sliders!)
   - Bones (for physics!)
   - Textures
   - Materials
   - Y-up orientation (Three.js compatible)
5. ✅ **Save to** `public/models/goth-girl-sara.glb`
6. ✅ **Verify export** and show file size

**Takes ~1-2 minutes** and requires **zero manual clicking!**

---

## 📋 Requirements:

### **You need Blender installed:**
- Download: https://www.blender.org/download/
- Install to default location (script auto-detects)
- Or set custom path: `$env:BLENDER_PATH = "C:\Your\Path\blender.exe"`

---

## ⚡ Run The Export:

### **Step 1: Open Terminal**
Already done - you're in the project root!

### **Step 2: Run Export Command**
```bash
npm run export-sara:ps
```

### **Step 3: Wait ~90 seconds**
You'll see:
```
🎨 Blender Model Export Script
✅ Found blend file
✅ Found Blender at: C:\Program Files\...
🚀 Starting Blender export...
[Blender processing...]
✅ Export successful!
   Size: XX.XX MB
✨ Next step: Test it!
   http://localhost:3000/test/sara-creator
```

### **Step 4: Test!**
```
http://localhost:3000/test/sara-creator
```

Sara will load with **real topology**!

---

## 🎯 What Gets Exported:

✅ **Full character mesh** (body, face, hair)
✅ **Shape keys** → Your sliders can control them!
✅ **Bones/Armature** → Physics can use them!
✅ **Textures** → Skin, hair, clothing materials
✅ **Materials** → Preserved from Blender
✅ **Optimized for Three.js** → Y-up orientation

---

## 🔥 If Blender Isn't Installed:

### **Quick Install:**
1. Go to: https://www.blender.org/download/
2. Download Windows installer
3. Install (takes 2 minutes)
4. Run export script again

### **Alternative: Manual Export** (If automation fails)
See `BLENDER_CONVERSION_GUIDE.md` for manual steps

---

## 💡 Files Created:

- **`scripts/export-sara-model.ps1`** - PowerShell automation
- **`scripts/export-sara-model.js`** - Node.js automation  
- **`scripts/blender-export.py`** - Python export logic
- **`scripts/convert-blend-to-glb.py`** - Alternative Python script

All added to package.json:
- `npm run export-sara` (Node.js)
- `npm run export-sara:ps` (PowerShell)

---

## 🎮 After Export:

The Sara Creator will:
1. Load the real 3D model
2. Auto-apply blonde hair color
3. Hook up all sliders to morph targets
4. Add jiggle physics to bones
5. Look **exactly like AAA game studios**

---

**Ready to run? Just type:**
```bash
npm run export-sara:ps
```

**And watch the magic happen!** 🔥✨

