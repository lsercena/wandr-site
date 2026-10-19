/**
 * Shared renderer for AI-generated itinerary markdown.
 * Used by the Travel Planner result, streaming output, and share pages.
 */
import './ItineraryMarkdown.css';

interface Props {
  content: string;
  /** Renders a trailing element (e.g. map/export toolbar) after the body. */
  className?: string;
}

export default function ItineraryMarkdown({ content, className }: Props) {
  const lines = content.split('\n');
  return (
    <div className={`itinerary-display${className ? ` ${className}` : ''}`}>
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return <h2 key={i} className="itinerary-h2">{line.slice(2)}</h2>;
        }
        if (line.startsWith('## ') || line.match(/^Day \d+/)) {
          return <h3 key={i} className="itinerary-h3">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('### ') || line.match(/^(Morning|Afternoon|Evening):/i)) {
          return <h4 key={i} className="itinerary-h4">{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={i} className="itinerary-li">{line.slice(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={i} className="itinerary-strong">{line.slice(2, -2)}</strong>;
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="itinerary-p">{line}</p>;
      })}
    </div>
  );
}
