import classNames from 'classnames/bind';

import styles from '~/pages/ADMIN/Location/Location.module.scss';
import Button from '~/components/Button';
import { forwardRef, Fragment, useEffect, useRef, useState } from 'react';
import { FormSearch } from '~/layout/Component/FormSearch';
import MessageDanger from '~/layout/Component/Message/MessageDanger';
import MessageSuccess from '~/layout/Component/Message/MessageSuccess';
import Location from '~/layout/Component/Location';
import { CreateData } from '~/api/General/HandleData';
import Modal from '~/layout/Component/Modal';
import Translate from '~/layout/Component/Translate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useImmer } from 'use-immer';

const cx = classNames.bind(styles);

export default function Ward({
  title,
  closeModal,
  resetValue = false,
  handleCloseLocation = () => {},
  id,
  handleReloadData = () => {},
}) {
  const nameRef = useRef();
  const countryRef = useRef();
  const cityRef = useRef();
  const districtRef = useRef();

  const messageValid = {
    name: Translate({ children: 'valid.name' }),
    international_codes: Translate({ children: 'valid.international_codes' }),
    acronym: Translate({ children: 'valid.acronym' }),
    district: Translate({ children: 'valid.district' }),
    city: Translate({ children: 'valid.city' }),
    ward: Translate({ children: 'valid.ward' }),
    country: Translate({ children: 'valid.country' }),
    createError: Translate({ children: 'message.create_error' }),
    createSuccess: Translate({ children: 'message.create_success' }),
  };
  const [valid, setValid] = useState({});
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');
  const [ward, setWard] = useImmer({
    name: '',
    country_id: '',
    city_id: '',
    district_id: '',
  });

  const handleSetLocation = (e) => {
    const { name, id } = e.target.dataset;
    setWard((darft) => {
      darft[name] = id;
    });
  };

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setWard((darft) => {
      darft[name] = value;
    });
  };

  const validate = async (filed = ward) => {
    const messageError = { ...valid };
    if ('name' in filed) {
      messageError.name = !filed.name ? messageValid.name : '';
    }
    if ('country_id' in filed) {
      messageError.country = !filed.country_id ? messageValid.country : '';
    }
    if ('city_id' in filed) {
      messageError.city = !filed.city_id ? messageValid.city : '';
    }
    if ('district_id' in filed) {
      messageError.district = !filed.district_id ? messageValid.district : '';
    }

    if (filed === ward) {
      Object.entries(messageError).map(([key, value]) => {
        if (value === '') {
          delete messageError[key];
        }
      });
    }

    if (messageError.name) {
      nameRef.current.classList.add('input_danger');
    } else {
      nameRef.current.classList.remove('input_danger');
    }

    // valid country
    if (countryRef) {
      const t = countryRef.current;
      if (t.dataset.id === '') {
        t.classList.add('input_danger');
      } else {
        t.classList.remove('input_danger');
      }
    }

    //valid city
    if (cityRef) {
      const t = cityRef.current;
      if (t.dataset.id === '') {
        t.classList.add('input_danger');
      } else {
        t.classList.remove('input_danger');
      }
    }

    // //valid district
    if (districtRef) {
      const t = districtRef.current;
      if (t.dataset.id === '') {
        t.classList.add('input_danger');
      } else {
        t.classList.remove('input_danger');
      }
    }
    setValid(messageError);
    return messageError;
  };

  /*submit form */
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    let val = await validate();
    if (ward.name !== '') {
      if (Object.keys(val).length === 0) {
        CreateData('admin', 'ward', ward)
          .then((result) => {
            if (result.success) {
              setCreateError('');
              setCreateSuccess(createSuccess);
              handleReloadData(1);
            } else {
              setCreateSuccess('');
              setCreateError(messageValid.createError);
            }
          })
          .catch((e) => console.log(e));
      }
    }
  };
  return (
    <Modal id={id} closeModal={closeModal}>
      <div className={cx('add-container')}>
        <form onSubmit={handleSubmitForm} className={cx('d-flex flex-column')} noValidate>
          <div className={cx('form_header', 'd-flex flex-row justify-content-between')}>
            <h4 className="text-capitalize">
              <Translate>{title}</Translate>
            </h4>
            <Button type="button" transparent onClick={handleCloseLocation} none_size>
              <FontAwesomeIcon icon={faClose} />
            </Button>
          </div>
          <div className={cx('form_content', 'form-group d-flex flex-row flex-wrap mb-3  ')}>
            <Location
              ref={countryRef}
              useColumn
              resetValue={resetValue}
              title="country"
              name="country_id"
              handleOnclick={handleSetLocation}
            />
            <Location
              ref={cityRef}
              useColumn
              resetValue={resetValue}
              title="city"
              name="city_id"
              foreignID={ward?.country_id}
              handleOnclick={handleSetLocation}
            />
            <Location
              ref={districtRef}
              title="district"
              useColumn
              resetValue={resetValue}
              name="district_id"
              foreignID={ward.city_id}
              handleOnclick={handleSetLocation}
            />
            <FormSearch
              ref={nameRef}
              useColumn
              title="name"
              resetValue={resetValue}
              name="name"
              handleOnchange={handleOnchange}
              useTippy={false}
            />
          </div>
          <MessageSuccess message={createSuccess} />
          <MessageDanger message={createError} />
          <div className={cx('btn_submit', 'text-center')}>
            <Button className="text-capitalize" gradient_primary small type="submit">
              <Translate>create</Translate>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
