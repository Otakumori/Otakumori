import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateRequestId } from '../../../../lib/request-id';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required', requestId },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { theme = 'random', gender = 'random', age = 'random', style = 'anime' } = body;

    // Generate procedural avatar configuration
    const avatarConfig = generateProceduralAvatar({
      theme,
      gender,
      age,
      style,
    });

    return NextResponse.json({
      ok: true,
      data: {
        config: avatarConfig,
        theme,
        style,
        generatedAt: new Date().toISOString(),
      },
      requestId,
    });
  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json({ ok: false, error: 'Generation failed', requestId }, { status: 500 });
  }
}

interface GenerationOptions {
  theme: string;
  gender: string;
  age: string;
  style: string;
}

function generateProceduralAvatar(options: GenerationOptions) {
  const { theme, gender, age, style } = options;

  console.warn('Generating avatar with style:', style, 'theme:', theme);

  // Random generators
  const random = (min: number, max: number) => Math.random() * (max - min) + min;
  const randomInt = (min: number, max: number) => Math.floor(random(min, max + 1));
  const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

  // Determine final values
  const finalGender = gender === 'random' ? randomChoice(['male', 'female']) : gender;
  const finalAge =
    age === 'random' ? randomChoice(['teen', 'young-adult', 'adult', 'mature']) : age;

  // Theme-based color palettes
  const themes = {
    cyberpunk: {
      primary: ['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00'],
      secondary: ['#1A1A1A', '#2F2F2F', '#404040'],
      accent: ['#FF0080', '#00FF80', '#8000FF'],
    },
    fantasy: {
      primary: ['#8B0000', '#4B0082', '#006400', '#B8860B'],
      secondary: ['#F5F5DC', '#FFE4B5', '#DEB887'],
      accent: ['#FFD700', '#FF69B4', '#00CED1'],
    },
    kawaii: {
      primary: ['#FF69B4', '#FFB6C1', '#87CEEB', '#98FB98'],
      secondary: ['#FFFFFF', '#FFFACD', '#F0F8FF'],
      accent: ['#FF1493', '#00BFFF', '#FFD700'],
    },
    gothic: {
      primary: ['#2F2F2F', '#000000', '#4B0082'],
      secondary: ['#696969', '#A9A9A9', '#D3D3D3'],
      accent: ['#8B0000', '#FF0000', '#FFD700'],
    },
    anime: {
      primary: ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4'],
      secondary: ['#FFFFFF', '#F8F9FA', '#E9ECEF'],
      accent: ['#FFD93D', '#6BCF7F', '#4D96FF'],
    },
  };

  const selectedTheme = themes[theme as keyof typeof themes] || themes.anime;
  const primaryColor = randomChoice(selectedTheme.primary);
  const secondaryColor = randomChoice(selectedTheme.secondary);
  const accentColor = randomChoice(selectedTheme.accent);

  // Hair styles based on gender and theme
  const hairStyles = {
    male: ['short', 'medium', 'long', 'spiky', 'curly'],
    female: ['short', 'medium', 'long', 'twintails', 'ponytail', 'curly', 'wavy'],
  };

  const hairColors = [
    '#8B4513',
    '#A0522D',
    '#D2691E',
    '#CD853F', // Brown shades
    '#000000',
    '#2F2F2F',
    '#696969', // Black/Gray
    '#FFD700',
    '#FFA500',
    '#FF8C00', // Blonde
    '#FF69B4',
    '#FF1493',
    '#DC143C', // Pink/Red
    '#00CED1',
    '#4682B4',
    '#1E90FF', // Blue
    '#9370DB',
    '#8A2BE2',
    '#9932CC', // Purple
  ];

  // Eye colors
  const eyeColors = [
    '#4A90E2',
    '#87CEEB',
    '#00CED1', // Blue
    '#32CD32',
    '#00FF7F',
    '#7FFF00', // Green
    '#FFD700',
    '#FFA500',
    '#FF8C00', // Amber
    '#8B4513',
    '#A0522D',
    '#D2691E', // Brown
    '#9370DB',
    '#8A2BE2',
    '#9932CC', // Purple
    '#FF69B4',
    '#FF1493',
    '#DC143C', // Pink
  ];

  // Generate configuration
  const config = {
    gender: finalGender,
    age: finalAge,
    body: {
      height: random(0.4, 0.6), // Normalized height
      weight: random(0.3, 0.7), // Normalized weight
      muscleMass: finalGender === 'male' ? random(0.5, 0.9) : random(0.3, 0.7),
      bodyFat: finalGender === 'male' ? random(0.1, 0.4) : random(0.15, 0.5),
      proportions: {
        headSize: random(0.4, 0.6),
        neckLength: random(0.4, 0.6),
        chestSize: finalGender === 'male' ? random(0.6, 0.9) : random(0.5, 0.8),
        waistSize: finalGender === 'male' ? random(0.4, 0.6) : random(0.3, 0.5),
        hipSize: finalGender === 'male' ? random(0.4, 0.6) : random(0.5, 0.8),
        armLength: random(0.4, 0.6),
        legLength: random(0.4, 0.6),
      },
      genderFeatures: {
        breastSize: finalGender === 'female' ? random(0.3, 0.8) : 0,
        hipWidth: finalGender === 'female' ? random(0.5, 0.8) : random(0.3, 0.5),
      },
    },
    face: {
      faceShape: {
        overall: random(0.3, 0.7),
        jawline: finalGender === 'male' ? random(0.6, 0.9) : random(0.3, 0.6),
        cheekbones: random(0.3, 0.8),
        chinShape: random(0.3, 0.7),
      },
      eyes: {
        size: random(0.7, 1.3),
        color: randomChoice(eyeColors),
        shape: randomChoice(['round', 'almond', 'cat-like']),
        spacing: random(0.4, 0.6),
      },
      nose: {
        size: random(0.4, 0.8),
        shape: randomChoice(['straight', 'button', 'aquiline']),
        width: random(0.3, 0.6),
      },
      mouth: {
        size: random(0.4, 0.8),
        shape: randomChoice(['thin', 'medium', 'full']),
        lipThickness: random(0.2, 0.8),
      },
      skin: {
        tone: random(0.2, 0.9), // 0 = very light, 1 = very dark
        texture: randomChoice(['smooth', 'normal', 'rough']),
      },
    },
    hair: {
      color: randomChoice(hairColors),
      style: randomChoice(hairStyles[finalGender as keyof typeof hairStyles]),
      length: random(0.2, 1.0),
      texture: randomChoice(['straight', 'wavy', 'curly', 'coily']),
    },
    outfit: {
      primary: {
        type: randomChoice([
          'casual',
          'formal',
          'athletic',
          'fantasy',
          'cyberpunk',
          'gothic',
          'kawaii',
        ]),
        color: primaryColor,
        accessories: [],
      },
      secondary: {
        type: randomChoice([
          'casual',
          'formal',
          'athletic',
          'fantasy',
          'cyberpunk',
          'gothic',
          'kawaii',
        ]),
        color: secondaryColor,
        accessories: [],
      },
      fit: {
        tightness: random(0.2, 0.8),
        length: random(0.3, 0.9),
        style: randomChoice(['loose', 'moderate', 'tight']),
      },
    },
    physics: {
      softBody: {
        enable: Math.random() > 0.5,
        mass: random(0.5, 1.5),
        stiffness: random(0.2, 0.8),
        damping: random(0.1, 0.5),
        maxDisplacement: random(0.02, 0.1),
      },
      cloth: {
        enable: Math.random() > 0.3,
        stiffness: random(0.3, 0.9),
        damping: random(0.2, 0.6),
        wind: random(0.0, 0.8),
      },
    },
    materials: {
      shader: randomChoice(['AnimeToon', 'Realistic', 'CelShaded', 'Stylized']),
      parameters: {
        glossStrength: random(0.1, 0.9),
        rimStrength: random(0.1, 0.7),
        colorA: primaryColor,
        colorB: secondaryColor,
        rimColor: accentColor,
        metallic: random(0.0, 0.3),
        roughness: random(0.2, 0.8),
      },
      textures: {
        diffuse: null,
        normal: null,
        specular: null,
        emissive: null,
      },
    },
    interactions: {
      poses: ['idle', 'standing', 'sitting'],
      emotes: ['happy', 'neutral', 'excited'],
      cameraModes: ['default', 'close-up'],
      fx: [],
    },
    nsfw: {
      enabled: false, // Default to disabled
      outfits: {
        suggestive: false,
        revealing: false,
      },
      physics: {
        jiggle: false,
        bounce: false,
      },
      interactions: {
        intimate: false,
        suggestive: false,
      },
    },
  };

  return config;
}
