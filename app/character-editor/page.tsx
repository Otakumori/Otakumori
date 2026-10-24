import { redirect } from 'next/navigation';

/** Compatibility route retained for historical links. */
export default function CharacterEditorCompatibilityPage() {
  redirect('/creator');
}
