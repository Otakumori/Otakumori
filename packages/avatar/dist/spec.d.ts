import { z } from 'zod';
/**
 * Comprehensive equipment slots covering all avatar customization points
 */
export declare const EquipmentSlot: z.ZodEnum<["Head", "Face", "Eyes", "Eyebrows", "Nose", "Mouth", "Ears", "Hair", "FacialHair", "Eyelashes", "Torso", "Chest", "Arms", "Hands", "Legs", "Feet", "Underwear", "InnerWear", "OuterWear", "Pants", "Shoes", "Gloves", "Headwear", "Eyewear", "Neckwear", "Earrings", "Bracelets", "Rings", "Horns", "Tail", "Wings", "AnimalEars", "Halo", "Back", "WeaponPrimary", "WeaponSecondary", "Shield", "NSFWChest", "NSFWGroin", "NSFWAccessory"]>;
export type EquipmentSlotType = z.infer<typeof EquipmentSlot>;
/**
 * Standard humanoid rig bones
 */
export declare const STANDARD_RIG_BONES: readonly ["Hips", "Spine", "Spine1", "Spine2", "Chest", "Neck", "Head", "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand", "RightShoulder", "RightArm", "RightForeArm", "RightHand", "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase", "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase"];
/**
 * Avatar specification v1.5 with comprehensive equipment and safety
 */
export declare const AvatarSpecV15: z.ZodObject<{
    version: z.ZodLiteral<"1.5">;
    baseMeshUrl: z.ZodString;
    rig: z.ZodObject<{
        root: z.ZodString;
        bones: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        root: string;
        bones: string[];
    }, {
        root: string;
        bones?: string[] | undefined;
    }>;
    morphs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        min: z.ZodDefault<z.ZodNumber>;
        max: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        min: number;
        max: number;
    }, {
        id: string;
        label: string;
        min?: number | undefined;
        max?: number | undefined;
    }>, "many">;
    morphWeights: z.ZodRecord<z.ZodString, z.ZodNumber>;
    equipment: z.ZodOptional<z.ZodRecord<z.ZodEnum<["Head", "Face", "Eyes", "Eyebrows", "Nose", "Mouth", "Ears", "Hair", "FacialHair", "Eyelashes", "Torso", "Chest", "Arms", "Hands", "Legs", "Feet", "Underwear", "InnerWear", "OuterWear", "Pants", "Shoes", "Gloves", "Headwear", "Eyewear", "Neckwear", "Earrings", "Bracelets", "Rings", "Horns", "Tail", "Wings", "AnimalEars", "Halo", "Back", "WeaponPrimary", "WeaponSecondary", "Shield", "NSFWChest", "NSFWGroin", "NSFWAccessory"]>, z.ZodNullable<z.ZodString>>>;
    palette: z.ZodObject<{
        primary: z.ZodString;
        secondary: z.ZodString;
        accent: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        primary: string;
        secondary: string;
        accent?: string | undefined;
    }, {
        primary: string;
        secondary: string;
        accent?: string | undefined;
    }>;
    nsfwPolicy: z.ZodObject<{
        allowNudity: z.ZodLiteral<false>;
    }, "strip", z.ZodTypeAny, {
        allowNudity: false;
    }, {
        allowNudity: false;
    }>;
    animationMap: z.ZodObject<{
        idle: z.ZodOptional<z.ZodString>;
        walk: z.ZodOptional<z.ZodString>;
        run: z.ZodOptional<z.ZodString>;
        jump: z.ZodOptional<z.ZodString>;
        fall: z.ZodOptional<z.ZodString>;
        land: z.ZodOptional<z.ZodString>;
        attack: z.ZodOptional<z.ZodString>;
        emote: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        idle?: string | undefined;
        walk?: string | undefined;
        run?: string | undefined;
        jump?: string | undefined;
        fall?: string | undefined;
        land?: string | undefined;
        attack?: string | undefined;
        emote?: string | undefined;
    }, {
        idle?: string | undefined;
        walk?: string | undefined;
        run?: string | undefined;
        jump?: string | undefined;
        fall?: string | undefined;
        land?: string | undefined;
        attack?: string | undefined;
        emote?: string | undefined;
    }>;
    metadata: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        author: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        author?: string | undefined;
    }, {
        name?: string | undefined;
        author?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    version: "1.5";
    baseMeshUrl: string;
    rig: {
        root: string;
        bones: string[];
    };
    morphs: {
        id: string;
        label: string;
        min: number;
        max: number;
    }[];
    morphWeights: Record<string, number>;
    palette: {
        primary: string;
        secondary: string;
        accent?: string | undefined;
    };
    nsfwPolicy: {
        allowNudity: false;
    };
    animationMap: {
        idle?: string | undefined;
        walk?: string | undefined;
        run?: string | undefined;
        jump?: string | undefined;
        fall?: string | undefined;
        land?: string | undefined;
        attack?: string | undefined;
        emote?: string | undefined;
    };
    equipment?: Partial<Record<"Chest" | "Head" | "Face" | "Eyes" | "Eyebrows" | "Nose" | "Mouth" | "Ears" | "Hair" | "FacialHair" | "Eyelashes" | "Torso" | "Arms" | "Hands" | "Legs" | "Feet" | "Underwear" | "InnerWear" | "OuterWear" | "Pants" | "Shoes" | "Gloves" | "Headwear" | "Eyewear" | "Neckwear" | "Earrings" | "Bracelets" | "Rings" | "Horns" | "Tail" | "Wings" | "AnimalEars" | "Halo" | "Back" | "WeaponPrimary" | "WeaponSecondary" | "Shield" | "NSFWChest" | "NSFWGroin" | "NSFWAccessory", string | null>> | undefined;
    metadata?: {
        name?: string | undefined;
        author?: string | undefined;
    } | undefined;
}, {
    version: "1.5";
    baseMeshUrl: string;
    rig: {
        root: string;
        bones?: string[] | undefined;
    };
    morphs: {
        id: string;
        label: string;
        min?: number | undefined;
        max?: number | undefined;
    }[];
    morphWeights: Record<string, number>;
    palette: {
        primary: string;
        secondary: string;
        accent?: string | undefined;
    };
    nsfwPolicy: {
        allowNudity: false;
    };
    animationMap: {
        idle?: string | undefined;
        walk?: string | undefined;
        run?: string | undefined;
        jump?: string | undefined;
        fall?: string | undefined;
        land?: string | undefined;
        attack?: string | undefined;
        emote?: string | undefined;
    };
    equipment?: Partial<Record<"Chest" | "Head" | "Face" | "Eyes" | "Eyebrows" | "Nose" | "Mouth" | "Ears" | "Hair" | "FacialHair" | "Eyelashes" | "Torso" | "Arms" | "Hands" | "Legs" | "Feet" | "Underwear" | "InnerWear" | "OuterWear" | "Pants" | "Shoes" | "Gloves" | "Headwear" | "Eyewear" | "Neckwear" | "Earrings" | "Bracelets" | "Rings" | "Horns" | "Tail" | "Wings" | "AnimalEars" | "Halo" | "Back" | "WeaponPrimary" | "WeaponSecondary" | "Shield" | "NSFWChest" | "NSFWGroin" | "NSFWAccessory", string | null>> | undefined;
    metadata?: {
        name?: string | undefined;
        author?: string | undefined;
    } | undefined;
}>;
export type AvatarSpecV15Type = z.infer<typeof AvatarSpecV15>;
/**
 * Clamps a morph weight value to the defined min/max range
 */
export declare function clampMorph(spec: AvatarSpecV15Type, morphId: string, value: number): number;
/**
 * Validates and clamps all morph weights in a spec
 */
export declare function clampAllMorphs(spec: AvatarSpecV15Type): AvatarSpecV15Type;
//# sourceMappingURL=spec.d.ts.map