// The open project's seam allowances (owner, 2026-11-14: project settings), for the fields that show
// and change them: Print, 3D Print, an EPP quilt's Layout tab. No project open: the defaults for the
// app's units, shown but not changeable.
import { computed } from 'vue';
import { projectSeams, setSeam, type SeamKind } from '@/model/seams';
import { useProjectStore } from '@/stores/project';
import { useSettingsStore } from '@/stores/settings';

export function useProjectSeams() {
  const project = useProjectStore();
  const app = useSettingsStore();
  const seams = computed(() => projectSeams(project.doc, app.settings.units));
  const canSet = computed(() => !!project.doc && !project.readOnly);
  const set = (kind: SeamKind, v: number) =>
    project.change((d) => void setSeam(d, kind, v), { coalesce: `seam-${kind}` });
  return { seams, canSet, set };
}
