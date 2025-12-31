interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  label?: string;
}

export const StarRating = ({ value, onChange, readonly = false, label }: StarRatingProps) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <div className="flex gap-1">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange?.(star)}
            disabled={readonly}
            className={`text-2xl transition-colors ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${star <= value ? 'text-yellow-400' : 'text-gray-600'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
};
