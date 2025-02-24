import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const TriangleCenters = () => {
  const [points, setPoints] = useState([
    { x: 100, y: 300 },
    { x: 300, y: 300 },
    { x: 200, y: 100 }
  ]);
  const [selectedCenter, setSelectedCenter] = useState('centroid');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef(null);

  const centerColors = {
    centroid: '#FF6B6B',
    circumcenter: '#4ECDC4',
    incenter: '#45B7D1',
    orthocenter: '#FFA07A'
  };

  const calculateCentroid = () => {
    const x = (points[0].x + points[1].x + points[2].x) / 3;
    const y = (points[0].y + points[1].y + points[2].y) / 3;
    return { x, y };
  };

  const calculateCircumcenter = () => {
    const [a, b, c] = points;
    const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
    const x = ((a.x * a.x + a.y * a.y) * (b.y - c.y) + (b.x * b.x + b.y * b.y) * (c.y - a.y) + (c.x * c.x + c.y * c.y) * (a.y - b.y)) / d;
    const y = ((a.x * a.x + a.y * a.y) * (c.x - b.x) + (b.x * b.x + b.y * b.y) * (a.x - c.x) + (c.x * c.x + c.y * c.y) * (b.x - a.x)) / d;
    return { x, y };
  };

  const calculateIncenter = () => {
    const [a, b, c] = points;
    const abc = Math.sqrt((b.x - c.x) ** 2 + (b.y - c.y) ** 2);
    const bca = Math.sqrt((c.x - a.x) ** 2 + (c.y - a.y) ** 2);
    const cab = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    const x = (abc * a.x + bca * b.x + cab * c.x) / (abc + bca + cab);
    const y = (abc * a.y + bca * b.y + cab * c.y) / (abc + bca + cab);
    return { x, y };
  };

  const calculateOrthocenter = () => {
    const [a, b, c] = points;
    const m1 = (b.y - c.y) / (b.x - c.x);
    const m2 = (c.y - a.y) / (c.x - a.x);
    const x = (m1 * m2 * (a.y - c.y) + m1 * (a.x + b.x) - m2 * (b.x + c.x)) / (2 * (m1 - m2));
    const y = -1 / m1 * (x - (a.x + b.x) / 2) + (a.y + b.y) / 2;
    return { x, y };
  };

  const getCenter = () => {
    switch (selectedCenter) {
      case 'centroid':
        return calculateCentroid();
      case 'circumcenter':
        return calculateCircumcenter();
      case 'incenter':
        return calculateIncenter();
      case 'orthocenter':
        return calculateOrthocenter();
      default:
        return { x: 0, y: 0 };
    }
  };

  const center = getCenter();

  const handlePointDrag = (index, e) => {
    if (!isDragging) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const newPoints = [...points];
    newPoints[index] = {
      x: Math.max(0, Math.min(400, e.clientX - svgRect.left)),
      y: Math.max(0, Math.min(400, e.clientY - svgRect.top))
    };
    setPoints(newPoints);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handlePointDrag(hoveredPoint, e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, hoveredPoint]);

  const centerInfo = {
    centroid: "The centroid is the arithmetic mean position of all points in the triangle. It's where the medians intersect!",
    circumcenter: "The circumcenter is equidistant from all vertices. It's where the perpendicular bisectors meet!",
    incenter: "The incenter is equidistant from all sides. It's where the angle bisectors intersect!",
    orthocenter: "The orthocenter is where the three altitudes of the triangle intersect. Cool, right?"
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
          <Sparkles className="mr-2" /> Triangle Centers Explorer <Sparkles className="ml-2" />
        </h2>
        <div className="mb-6 flex justify-center">
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="px-4 py-2 rounded-full text-lg font-semibold bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="centroid">Centroid</option>
            <option value="circumcenter">Circumcenter</option>
            <option value="incenter">Incenter</option>
            <option value="orthocenter">Orthocenter</option>
          </select>
        </div>
        <div className="text-center mb-2">
          <p className="text-lg font-semibold text-blue-600">Drag the blue points to explore!</p>
        </div>
        <div className="relative">
          <svg width="400" height="400" className="mx-auto border-4 border-gray-200 rounded-lg" ref={svgRef}>
            <polygon
              points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y}`}
              fill="rgba(147, 197, 253, 0.3)"
              stroke="#3B82F6"
              strokeWidth="2"
            />
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="8"
                fill={hoveredPoint === index ? '#60A5FA' : '#3B82F6'}
                stroke={hoveredPoint === index ? '#2563EB' : 'none'}
                strokeWidth="2"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => !isDragging && setHoveredPoint(null)}
                onMouseDown={() => {
                  setIsDragging(true);
                  setHoveredPoint(index);
                }}
                style={{ cursor: 'pointer' }}
              />
            ))}
            <circle cx={center.x} cy={center.y} r="6" fill={centerColors[selectedCenter]} />
          </svg>
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-800">
            {selectedCenter.charAt(0).toUpperCase() + selectedCenter.slice(1)} coordinates:
          </p>
          <p className="text-xl font-bold text-purple-600">
            ({center.x.toFixed(2)}, {center.y.toFixed(2)})
          </p>
        </div>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-700">{centerInfo[selectedCenter]}</p>
        </div>
      </div>
    </div>
  );
};

export default TriangleCenters;