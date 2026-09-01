function CatMascot({ mode = "idle" }) {
  return (
    <div className="auth-cat-wrap" aria-hidden="true">
      <svg
        className={`auth-cat-svg ${mode}`}
        data-mode={mode}
        viewBox="0 0 240 180"
      >
        <ellipse cx="120" cy="160" rx="62" ry="16" className="cat-shadow-svg" />

        <g className="cat-body-group">
          <path
            d="M62 118Q60 82 98 72L145 72Q179 82 176 118L170 142Q140 160 120 160Q100 160 70 142Z"
            className="cat-body-svg"
          />
          <path
            d="M92 103Q108 92 120 92Q132 92 148 103"
            className="cat-belly-svg"
          />
        </g>

        <g className="cat-head-group">
          <path d="M76 60L58 30L92 42Z" className="cat-ear-svg" />
          <path d="M164 60L182 30L148 42Z" className="cat-ear-svg" />

          <path
            d="M70 64Q74 36 120 28Q166 36 170 64L171 105Q170 126 120 130Q70 126 69 105Z"
            className="cat-head-svg"
          />

          <g className="cat-eyes-svg">
            <g className="eye left-eye">
              <ellipse cx="97" cy="74" rx="12" ry="16" className="eye-white" />
              <circle cx="100" cy="77" r="4.5" className="eye-pupil" />
            </g>
            <g className="eye right-eye">
              <ellipse cx="143" cy="74" rx="12" ry="16" className="eye-white" />
              <circle cx="140" cy="77" r="4.5" className="eye-pupil" />
            </g>
          </g>

          <path
            d="M120 85 Q116 90 120 95 Q124 90 120 85"
            className="cat-nose-svg"
          />
          <path
            d="M120 95 Q110 103 101 104 M120 95 Q130 103 139 104"
            className="cat-mouth-svg"
          />
          <path
            d="M73 90 Q50 94 38 102 M73 98 Q52 104 38 112"
            className="cat-whisker left-whisker"
          />
          <path
            d="M167 90 Q190 94 202 102 M167 98 Q188 104 202 112"
            className="cat-whisker right-whisker"
          />
        </g>
      </svg>
    </div>
  );
}

export default CatMascot;
