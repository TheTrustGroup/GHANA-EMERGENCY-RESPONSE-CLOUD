'use client';

/**
 * Report Builder Component
 * Drag-and-drop report builder (simplified version)
 */

import { useState } from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReportSection, ReportSectionType } from '@/types/reports';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReportBuilderProps {
  sections: ReportSection[];
  onChange: (sections: ReportSection[]) => void;
}

const SECTION_TYPES: Array<{ value: ReportSectionType; label: string; icon: string }> = [
  { value: 'text', label: 'Text Block', icon: '📝' },
  { value: 'metric', label: 'Metric Card', icon: '📊' },
  { value: 'chart', label: 'Chart', icon: '📈' },
  { value: 'table', label: 'Table', icon: '📋' },
  { value: 'map', label: 'Map', icon: '🗺️' },
  { value: 'executive_summary', label: 'Executive Summary', icon: '📋' },
  { value: 'key_metrics', label: 'Key Metrics', icon: '📊' },
  { value: 'incident_list', label: 'Incident List', icon: '📝' },
  { value: 'agency_performance', label: 'Agency Performance', icon: '🏢' },
  { value: 'recommendations', label: 'Recommendations', icon: '💡' },
];

export function ReportBuilder({ sections, onChange }: ReportBuilderProps) {
  const [selectedType, setSelectedType] = useState<ReportSectionType | ''>('');

  const addSection = () => {
    if (!selectedType) return;

    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      type: selectedType,
      order: sections.length + 1,
      title: selectedType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    };

    onChange([...sections, newSection]);
    setSelectedType('');
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id).map((s, index) => ({ ...s, order: index + 1 })));
  };

  const updateSection = (id: string, updates: Partial<ReportSection>) => {
    onChange(
      sections.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    onChange(newSections.map((s, i) => ({ ...s, order: i + 1 })));
  };

  return (
    <div className="space-y-4">
      {/* Add Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select section type" />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addSection} disabled={!selectedType}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections List */}
      <div className="space-y-2">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <CardTitle className="text-lg">{section.title || section.type}</CardTitle>
                    <Badge variant="outline">{section.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={section.order === 1}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={section.order === sections.length}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(section.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={section.title || ''}
                      onChange={(e) =>
                        updateSection(section.id, { title: e.target.value })
                      }
                      placeholder="Section title"
                    />
                  </div>
                  {section.type === 'chart' && (
                    <div>
                      <Label>Chart Type</Label>
                      <Select
                        value={section.config?.chartType || 'bar'}
                        onValueChange={(v: any) =>
                          updateSection(section.id, {
                            config: { ...section.config, chartType: v },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                          <SelectItem value="donut">Donut Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {section.type === 'text' && (
                    <div>
                      <Label>Content</Label>
                      <textarea
                        value={section.config?.content || ''}
                        onChange={(e) =>
                          updateSection(section.id, {
                            config: { ...section.config, content: e.target.value },
                          })
                        }
                        className="w-full min-h-[100px] p-2 border rounded"
                        placeholder="Enter text content"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {sections.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No sections added yet. Use the form above to add sections to your report.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

