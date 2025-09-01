 
 
export interface Track {
  code: string;
  title: string;
  url: string;
}

export const playlist: Track[] = [
  {
    code: 'track.theme.sakura',
    title: 'Sakura Theme',
    url: '/audio/sakura-theme.mp3',
  },
  {
    code: 'track.arcade.loop',
    title: 'Arcade Loop',
    url: '/audio/arcade-loop.mp3',
  },
];
