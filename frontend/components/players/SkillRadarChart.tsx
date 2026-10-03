'use client';

import { TechnicalSkills, PhysicalAttributes, MentalAttributes, SkillRating } from '@/types/player';

interface SkillRadarChartProps {
  data: {
    technical: TechnicalSkills;
    physical: PhysicalAttributes;
    mental: MentalAttributes;
  };
  size?: number;
}

export default function SkillRadarChart({ data, size = 300 }: SkillRadarChartProps) {
  // Helper function to calculate average of all numeric values in an object (recursive for nested objects)
  const getSkillAverage = (skillObj: any): number => {
    if (!skillObj || typeof skillObj !== 'object') return 0;

    const allValues: number[] = [];

    // Recursively collect all numeric values
    const collectValues = (obj: any) => {
      Object.values(obj).forEach(v => {
        if (typeof v === 'number') {
          allValues.push(v);
        } else if (typeof v === 'object' && v !== null) {
          collectValues(v);
        }
      });
    };

    collectValues(skillObj);
    return allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0;
  };

  // Extract key skills for radar - using the same logic as the skill cards
  const skills = [
    { name: 'Serving', value: getSkillAverage(data.technical?.serving), color: '#3B82F6' },
    { name: 'Passing', value: getSkillAverage(data.technical?.passing), color: '#06B6D4' },
    { name: 'Setting', value: getSkillAverage(data.technical?.setting), color: '#8B5CF6' },
    { name: 'Attacking', value: getSkillAverage(data.technical?.attacking), color: '#EF4444' },
    { name: 'Blocking', value: getSkillAverage(data.technical?.blocking), color: '#F59E0B' },
    { name: 'Defense', value: getSkillAverage(data.technical?.defense), color: '#10B981' },
    { name: 'Mental', value: getSkillAverage(data.mental), color: '#EC4899' },
    { name: 'Physical', value: getSkillAverage(data.physical?.flexibility), color: '#6366F1' },
  ];

  const center = size / 2;
  const radius = (size - 80) / 2;
  const angleStep = (2 * Math.PI) / skills.length;

  // Generate radar chart paths
  const generatePath = (values: number[], scale = 1) => {
    let path = '';
    values.forEach((value, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const distance = (value / 10) * radius * scale;
      const x = center + Math.cos(angle) * distance;
      const y = center + Math.sin(angle) * distance;
      path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return path + ' Z';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <svg width={size} height={size} className="drop-shadow-lg">
          {/* Background circles */}
          {[2, 4, 6, 8, 10].map(level => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={(level / 10) * radius}
              fill="none"
              stroke="rgb(229, 231, 235)"
              strokeWidth="1"
              className="dark:stroke-gray-700"
            />
          ))}

          {/* Grid lines */}
          {skills.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgb(229, 231, 235)"
                strokeWidth="1"
                className="dark:stroke-gray-700"
              />
            );
          })}

          {/* Data area */}
          <path
            d={generatePath(skills.map(s => s.value))}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            className="drop-shadow-sm"
          />

          {/* Data points */}
          {skills.map((skill, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const distance = (skill.value / 10) * radius;
            const x = center + Math.cos(angle) * distance;
            const y = center + Math.sin(angle) * distance;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={skill.color}
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-sm"
              />
            );
          })}

          {/* Labels */}
          {skills.map((skill, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelDistance = radius + 25;
            const x = center + Math.cos(angle) * labelDistance;
            const y = center + Math.sin(angle) * labelDistance;
            return (
              <text
                key={index}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-medium fill-gray-700 dark:fill-gray-300"
              >
                {skill.name}
              </text>
            );
          })}

          {/* Center rating */}
          <circle
            cx={center}
            cy={center}
            r="20"
            fill="white"
            stroke="rgb(229, 231, 235)"
            strokeWidth="2"
            className="drop-shadow-sm dark:fill-gray-800 dark:stroke-gray-700"
          />
          <text
            x={center}
            y={center - 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-lg font-bold fill-gray-900 dark:fill-gray-100"
          >
            {(skills.reduce((sum, s) => sum + s.value, 0) / skills.length).toFixed(1)}
          </text>
          <text
            x={center}
            y={center + 12}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-xs fill-gray-500 dark:fill-gray-400"
          >
            AVG
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: skill.color }}
            />
            <span className="text-gray-600 dark:text-gray-400 truncate">{skill.name}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{skill.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}