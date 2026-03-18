'use client';

import React, { useMemo } from 'react';
import { quiltographerTheme } from '../japanese/theme';
import type { MaterialRequirement } from '@/lib/reader/schema';

const theme = quiltographerTheme;

const TYPE_ORDER = ['fabric', 'precut', 'notion', 'thread', 'tool'] as const;

const TYPE_LABELS: Record<string, string> = {
  fabric: 'Fabrics',
  precut: 'Precuts',
  notion: 'Notions',
  thread: 'Thread',
  tool: 'Tools',
};

interface MaterialsListProps {
  materials: MaterialRequirement[];
  checkedIds: string[];
  onToggle: (id: string) => void;
}

export function MaterialsList({ materials, checkedIds, onToggle }: MaterialsListProps) {
  const checkedSet = useMemo(() => new Set(checkedIds), [checkedIds]);

  const grouped = useMemo(() => {
    const groups: Record<string, MaterialRequirement[]> = {};
    materials.forEach(mat => {
      const key = mat.type || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(mat);
    });

    // Sort groups by predefined order, then alphabetical for unknowns
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a as typeof TYPE_ORDER[number]);
      const bi = TYPE_ORDER.indexOf(b as typeof TYPE_ORDER[number]);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedKeys.map(key => ({
      type: key,
      label: TYPE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
      items: groups[key],
    }));
  }, [materials]);

  const checkedCount = checkedIds.length;
  const totalCount = materials.length;
  const allChecked = totalCount > 0 && checkedCount === totalCount;

  const handleToggleAll = () => {
    if (allChecked) {
      // Uncheck all
      checkedIds.forEach(id => onToggle(id));
    } else {
      // Check all unchecked
      materials.forEach(mat => {
        if (!checkedSet.has(mat.id)) {
          onToggle(mat.id);
        }
      });
    }
  };

  if (materials.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: theme.colors.washi,
      backgroundImage: theme.textures.washiFiber,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.inkGray}20`,
      overflow: 'hidden',
      boxShadow: theme.shadows.soft,
    }}>
      {/* Header */}
      <div style={{
        padding: theme.spacing.breathe,
        borderBottom: theme.borders.hairline,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.washiDark,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontWeight: 600,
            color: theme.colors.indigo,
            fontFamily: theme.typography.fontFamily.display,
            fontSize: theme.typography.fontSize.lg,
          }}>
            Materials
          </span>
          <span style={{
            fontSize: theme.typography.fontSize.sm,
            color: checkedCount === totalCount && totalCount > 0
              ? theme.colors.sage
              : theme.colors.inkGray,
            fontWeight: checkedCount === totalCount && totalCount > 0 ? 600 : 400,
          }}>
            {checkedCount} of {totalCount} gathered
          </span>
        </div>

        <button
          onClick={handleToggleAll}
          style={{
            padding: '0.375rem 0.875rem',
            backgroundColor: 'transparent',
            color: theme.colors.indigo,
            border: theme.borders.subtle,
            borderRadius: theme.radius.md,
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.sm,
            fontFamily: theme.typography.fontFamily.body,
            transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
          }}
        >
          {allChecked ? 'Uncheck All' : 'Check All'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '3px',
        backgroundColor: theme.colors.washiDark,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}%`,
          backgroundColor: checkedCount === totalCount && totalCount > 0
            ? theme.colors.sage
            : theme.colors.persimmon,
          borderRadius: theme.radius.full,
          transition: `width ${theme.timing.unfold} ${theme.timing.easeOut}`,
        }} />
      </div>

      {/* Material groups */}
      <div style={{ padding: theme.spacing.breathe }}>
        {grouped.map((group, gi) => (
          <div key={group.type} style={{
            marginBottom: gi < grouped.length - 1 ? '1.25rem' : 0,
          }}>
            {/* Section header */}
            <h4 style={{
              margin: '0 0 0.5rem 0',
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.indigo,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: theme.typography.fontFamily.body,
              borderBottom: `2px solid ${theme.colors.indigo}25`,
              paddingBottom: '0.375rem',
            }}>
              {group.label}
            </h4>

            {/* Items */}
            {group.items.map(item => {
              const isChecked = checkedSet.has(item.id);
              return (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.5rem',
                    marginBottom: '0.25rem',
                    borderRadius: theme.radius.sm,
                    cursor: 'pointer',
                    backgroundColor: isChecked ? `${theme.colors.sage}12` : 'transparent',
                    transition: `background-color ${theme.timing.quick} ${theme.timing.easeOut}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(item.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      marginTop: '2px',
                      accentColor: theme.colors.sage,
                      cursor: 'pointer',
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontSize: theme.typography.fontSize.base,
                        fontFamily: theme.typography.fontFamily.body,
                        color: isChecked ? theme.colors.inkLight : theme.colors.inkBlack,
                        textDecoration: isChecked ? 'line-through' : 'none',
                        fontWeight: 500,
                        transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                      }}>
                        {item.name}
                      </span>

                      {(item.amount || item.quantity) && (
                        <span style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: isChecked ? theme.colors.inkLight : theme.colors.persimmon,
                          fontWeight: isChecked ? 400 : 500,
                          textDecoration: isChecked ? 'line-through' : 'none',
                          transition: `all ${theme.timing.quick} ${theme.timing.easeOut}`,
                        }}>
                          {item.amount || item.quantity}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <div style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.inkGray,
                        marginTop: '0.25rem',
                        lineHeight: theme.typography.lineHeight.normal,
                      }}>
                        {item.notes}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MaterialsList;
