import { useId, useState } from "react";
import Icon from "./Icon";

const RATINGS = [1, 2, 3, 4, 5];

export default function RatingStars({ value, onChange, readOnly = false, label = "Rating" }) {
  const [previewValue, setPreviewValue] = useState(null);
  const groupId = useId();
  const selectedValue = Math.max(0, Math.min(5, Number(value) || 0));
  const displayedValue = previewValue ?? selectedValue;

  if (readOnly) {
    return (
      <div className="rating-readonly" role="img" aria-label={`${selectedValue} out of 5 stars`}>
        <span className="rating-stars-row" aria-hidden="true">
          {RATINGS.map((rating) => (
            <span className={rating <= selectedValue ? "is-filled" : ""} key={rating}>
              <Icon name="star" size={22} />
            </span>
          ))}
        </span>
        <strong>{selectedValue.toFixed(1)}</strong>
      </div>
    );
  }

  return (
    <fieldset className="rating-fieldset" onMouseLeave={() => setPreviewValue(null)}>
      <legend>{label}</legend>
      <div
        className="rating-stars-control"
        role="radiogroup"
        aria-label={label}
        dir="ltr"
      >
        {RATINGS.map((rating) => (
          <span className="rating-option" key={rating}>
            <input
              className="sr-only"
              type="radio"
              id={`${groupId}-rating-${rating}`}
              name={`${groupId}-rating`}
              value={rating}
              checked={selectedValue === rating}
              onChange={() => onChange(rating)}
              aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`}
            />
            <label
              htmlFor={`${groupId}-rating-${rating}`}
              className={rating <= displayedValue ? "is-filled" : ""}
              onMouseEnter={() => setPreviewValue(rating)}
            >
              <Icon name="star" size={26} />
            </label>
          </span>
        ))}
      </div>
    </fieldset>
  );
}
