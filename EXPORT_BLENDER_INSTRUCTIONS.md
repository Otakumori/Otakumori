# 🎨 Quick Blender Export Instructions

## Step 1: Open Blender

Open `Goth Girl Sara Release Model v1.2.blend` in Blender

---

## Step 2: Export to GLB

### **Quick Export:**
1. **File** → **Export** → **glTF 2.0 (.glb/.gltf)**

### **Settings:**
```
Format: glTF Binary (.glb) ✅
Include:
  ✅ Selected Objects (or check "All")
  ✅ Custom Properties
  
Mesh:
  ✅ Apply Modifiers
  ✅ UVs
  ✅ Normals
  ✅ Tangents
  ✅ Vertex Colors
  
Objects:
  ✅ Cameras: OFF
  ✅ Punctual Lights: OFF
  
Materials:
  ✅ Materials: Export
  ✅ Images: Automatic
  
Animation:
  ✅ Shape Keys (IMPORTANT!)
  ✅ Shape Key Tangents
  ✅ Skinning
  ✅ Bake Skins
  ✅ All Actions: OFF (unless needed)
  
Transform:
  ✅ +Y Up (Important for Three.js!)
```

### **Save Location:**
```
C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\public\models\goth-girl-sara.glb
```

---

## Step 3: Verify Export

Check that the file was created:
- File size should be 20-100MB (with textures)
- Location: `public/models/goth-girl-sara.glb`

---

## Step 4: Test in Creator

Navigate to:
```
http://localhost:3000/test/sara-creator
```

You should see Sara loaded with:
- ✅ Full body mesh
- ✅ Hair
- ✅ Face details
- ✅ All sliders working

---

## 🔥 What Will Happen:

Once exported, the creator will:
1. ✅ Load Sara's actual mesh (not primitives!)
2. ✅ Apply blonde hair color automatically
3. ✅ Make skin glossy and smooth
4. ✅ Hook up jiggle physics to her bones
5. ✅ All sliders control morph targets/bones
6. ✅ Look **exactly like AAA game studios**

---

## ⚡ Alternative: Online Converter

If Blender export fails, use:

**Option A:**
1. Go to: https://products.aspose.app/3d/conversion/blend-to-glb
2. Upload: `Goth Girl Sara Release Model v1.2.blend`
3. Convert → Download GLB
4. Save to: `public/models/goth-girl-sara.glb`

**Option B:**
1. Go to: https://anyconv.com/blend-to-glb-converter/
2. Upload blend file
3. Download GLB
4. Save to project

---

## 🎯 After Export:

The model loader will:
- Auto-detect morph targets (shape keys)
- Apply your slider values
- Make her blonde
- Add jiggle physics
- Look **perfect**!

---

**Export takes ~2 minutes, then she'll look AAA quality instantly!** 🔥

