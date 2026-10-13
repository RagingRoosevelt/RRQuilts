import { newId } from './ids';
import { VERSION, type RrqDoc, type Units } from './schema/project';

export function createProject(name = 'Untitled', units: Units = 'in', app = 'dev'): RrqDoc {
  return {
    format: 'rrq',
    version: VERSION,
    app,
    units,
    project: {
      id: newId(),
      name,
      palette: { fabrics: [], colors: [], threads: [] },
      blocks: [],
      photos: [],
      embroidery: [],
      quilts: [],
      fonts: [],
      // The built-in Basic colors palette starts picked (src/content/starter.ts).
      libraryPalettes: ['rrquilts.basic-colors'],
    },
  };
}
