import classNames from 'classnames/bind';
import styles from './FormGroup.module.scss';
import { forwardRef, useEffect, useState } from 'react';
import { format } from 'date-fns';

const cx = classNames.bind(styles);

export const FormDate = forwardRef(function Form({
  title,
  containerClass,
  inputClassname,
  handleSetValue = () => {},
  data,
  inputRef,
}) {
  const [value, setValue] = useState(() => {
    if (data) {
      return format(new Date(data), 'yyyy-MM-dd');
    } else {
      return '';
    }
  });

  useEffect(() => {
    handleSetValue(value);
  });
  return (
    <div className={cx('form-date', containerClass || 'form-group flex-grow-1')}>
      <label className={cx('form-label text-capitalize')}>{title}</label>
      <input
        className={cx(inputClassname ? `${inputClassname}` : ' form-control py-2')}
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
});