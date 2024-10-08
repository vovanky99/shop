import classNames from 'classnames/bind';
import styles from '../Voucher.module.scss';
import TollsEdit from '~/layout/Component/TollsEdit';

const cx = classNames.bind(styles);

export default function ListVoucher({
  handleDelete = () => {},
  P_id,
  data,
  P_name,
  P_percents,
  P_status,
  P_cat_id,
  P_code,
  P_start_day,
  P_end_day,
  P_descriptions,
  P_cat_name,
  P_quantity,
}) {
  return (
    <>
      <tr className={cx(`tbody-element`)}>
        <td>{P_name}</td>
        <td>{P_code}</td>
        <td>{P_status === 1 ? 'Show' : 'Hide'}</td>
        <td>{P_percents}</td>
        <td>{P_quantity === null ? 'Unlimmeted' : P_quantity}</td>
        <td>{P_cat_id === null ? 'All product' : P_cat_name}</td>
        <td>{P_start_day}</td>
        <td>{P_end_day}</td>
        <td>
          <TollsEdit type="voucher" namePath="voucher" data={data} />
        </td>
      </tr>
    </>
  );
}
