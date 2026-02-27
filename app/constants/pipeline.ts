import {
  Braces,
  Eye,
  FileUp,
  ListChecks,
  Package,
  type LucideIcon,
} from 'lucide-vue-next'

import type { PipelineStage } from '~/stores/tutorial'

export interface PipelineStepConfig {
  id: Extract<PipelineStage, 'upload' | 'json' | 'steps' | 'preview' | 'export'>
  label: string
  icon: LucideIcon
}

export const PIPELINE_ORDER: PipelineStage[] = ['upload', 'extracting', 'json', 'steps', 'preview', 'export']

export const PIPELINE_STEPS: PipelineStepConfig[] = [
  { id: 'upload', label: 'Upload', icon: FileUp },
  { id: 'json', label: 'Extract', icon: Braces },
  { id: 'steps', label: 'Refine', icon: ListChecks },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'export', label: 'Export', icon: Package },
]
