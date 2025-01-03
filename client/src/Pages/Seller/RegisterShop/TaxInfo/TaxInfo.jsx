import { useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import { useImmer } from 'use-immer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation, faPlus } from '@fortawesome/free-solid-svg-icons';

import styles from '../RegisterShop.module.scss';
import Button from '~/components/Button';
import Location from '../Location';
import { FormText } from '~/layout/Component/FormGroup/FormText';
import { FormSearch } from '~/layout/Component/FormSearch';
import EmailItem from './EmailItem';
import MessageDanger from '~/layout/Component/Message/MessageDanger';
import LocalStorageService from '~/services/LocalStorageService';
import { RegisterShop } from '~/api/Seller/Profile';
import Translate from '~/layout/Component/Translate';
import RadioList from '~/layout/Component/RadioList';

const cx = classNames.bind(styles);

export default function TaxInfo({ email, location }) {
  const locationRef = useRef();
  const businessNameRef = useRef();
  const addressRef = useRef();
  const businessTypeOption = [
    { type: 1, title: 'business_type_option' },
    { type: 2, title: 'household_business' },
    { type: 3, title: 'company' },
  ];
  const [valid, setValid] = useImmer({});
  const [taxInfo, setTaxInfo] = useImmer(() => {
    if (LocalStorageService.getItem('taxInfoValue')) {
      return LocalStorageService.getItem('taxInfoValue');
    } else {
      return {
        business_name: '',
        business_type: 1,
        register_bussiness_address: {
          ward_id: location.ward_id || '',
          ward_name: location.ward_name || '',
          district_name: location.district_name || '',
          district_id: location.district_id || '',
          city_name: location.city_name || '',
          city_id: location.city_id || '',
          address: location.address || '',
        },
        email_receive_electronic_invoice: { email_1: { name: 'email_1', value: email || '', error: '' } },
        tax_code: '',
      };
    }
  });

  const handlePassLocationValue = (value) => {
    setTaxInfo((draft) => {
      for (let key in value) {
        if (draft.hasOwnProperty[key]) {
          draft[key] = value[key];
        }
      }
    });
  };

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setTaxInfo((draft) => {
      draft[name] = value;
    });
  };

  const handleOnchangeEmail = (e) => {
    const { name, value } = e.target;
    setTaxInfo((draft) => {
      draft.email_receive_electronic_invoice[name].value = value;
    });
  };

  const handleOnchangeAddress = (e) => {
    const { name, value } = e.target;
    setTaxInfo((draft) => {
      draft.register_bussiness_address[name] = value;
    });
  };

  const handleAddEmail = (e) => {
    const i = parseInt(Object.keys(taxInfo.email_receive_electronic_invoice).pop().match(/[0-9]/g)[0]);
    setTaxInfo((draft) => {
      draft.email_receive_electronic_invoice[`email_${i + 1}`] = { name: `email_${i + 1}`, value: '', error: '' };
    });
  };

  const handleRemoveEmail = (e) => {
    const { name } = e.currentTarget.dataset;
    setTaxInfo((draft) => {
      delete draft.email_receive_electronic_invoice[name];
    });
  };

  const validate = (field = taxInfo) => {
    const messageError = { valid };
    if ('business_name' in field) {
      messageError.business_name =
        !field.business_name && field.business_type !== 1 ? 'Please enter business name!' : '';
      if (businessNameRef.current && !field.business_name && field.business_type !== 1) {
        businessNameRef.current.classList.add('input_danger');
      }
    }
    if ('ward_id' in field.register_bussiness_address) {
      messageError.location = !field.register_bussiness_address.ward_id ? 'Please select location!' : '';
      if (locationRef.current && !field.register_bussiness_address.ward_id) {
        locationRef.current.classList.add('input_danger');
      }
    }
    if ('address' in field.register_bussiness_address) {
      messageError.address = !field.register_bussiness_address.address ? 'Please enter address!' : '';
      if (addressRef.current && !field.register_bussiness_address.address) {
        addressRef.current.classList.add('input_danger');
      }
    }
    Object.values(taxInfo.email_receive_electronic_invoice).map((d) => {
      if (`${d.name}` in field.email_receive_electronic_invoice) {
        setTaxInfo((draft) => {
          draft.email_receive_electronic_invoice[d.name].error = !field.email_receive_electronic_invoice[d.name].value
            ? 'Please enter email!'
            : !field.email_receive_electronic_invoice[d.name].value.match(/@gmail.com/g)
            ? "email don't valid!"
            : '';
        });
      }
    });
  };
  const handleBackSettingShipping = (e) => {
    const stepsRegister = document.querySelectorAll('.steps_register');
    const settingContent = document.getElementById('setting_shipping_content');
    const taxInfoContent = document.getElementById('tax_info_content');
    if (stepsRegister && settingContent) {
      for (let i = 0; i < stepsRegister.length; i++) {
        if (stepsRegister[i].getAttribute('id') === 'setting_ship') {
          stepsRegister[i].classList.add('active');
          stepsRegister[i].classList.remove('finished');
          stepsRegister[i + 1].classList.remove('active');
          settingContent.classList.add('active');
          taxInfoContent.classList.remove('active');
          LocalStorageService.removeItem('taxInfo', true);
          LocalStorageService.setItem('settingShipping', true);
        }
      }
    }
  };

  const handleNextIdentificationInfo = (e) => {
    const stepsRegister = document.querySelectorAll('.steps_register');
    const taxContent = document.getElementById('tax_info_content');
    const identificationInfoContent = document.getElementById('identification_info_content');
    validate();
    if (
      Object.entries(valid).length === 0 &&
      Object.values(taxInfo.email_receive_electronic_invoice).filter((dt) => dt.error !== '').length === 0
    ) {
      for (let i = 0; i < stepsRegister.length; i++) {
        if (stepsRegister[i].getAttribute('id') === 'identification_info') {
          stepsRegister[i].classList.add('active');
          stepsRegister[i - 1].classList.remove('active');
          stepsRegister[i - 1].classList.add('finished');
          taxContent.classList.remove('active');
          identificationInfoContent.classList.add('active');
          LocalStorageService.setItem('IdentificationInfo', true);
          LocalStorageService.setItem('taxInfoValue', taxInfo);
          LocalStorageService.removeItem('taxInfo');
        }
      }
    }
  };

  /* handle remove active for radio when select other radio */
  const handleClickBusinessOption = (e) => {
    const { type, color } = e.currentTarget.dataset;
    setTaxInfo((draft) => {
      draft.business_type = parseInt(type);
    });
  };

  /*set default value for radio identity form of identification */
  useEffect(() => {
    const radioItem = document.querySelectorAll('.business_type_item');
    for (let i = 0; i < radioItem.length; i++) {
      if (parseInt(radioItem[i].dataset.type) === taxInfo.business_type) {
        radioItem[i].classList.add(`radio_${radioItem[i].dataset.color}_active`);
      }
    }
  }, []);

  /* handle valid for location  */
  useEffect(() => {
    const location = locationRef.current;
    const handleBlur = (e) => {
      const { name, classList } = e.target;
      if (!taxInfo.register_bussiness_address.ward_id) {
        setValid((draft) => {
          draft[name] = 'please select location before enter address!';
        });
        classList.add('input_danger');
      } else {
        setValid((draft) => {
          delete draft[name];
        });
        classList.remove('input_danger');
      }
    };
    if (location) {
      location.addEventListener('blur', handleBlur);
    }
    return () => {
      if (location) {
        location.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  /* handle blur for address */
  useEffect(() => {
    const address = addressRef.current;

    const handleBlur = (e) => {
      const { value, classList, name } = e.target;
      if (!value) {
        setValid((draft) => {
          draft[name] = 'please enter address!';
        });
        classList.add('input_danger');
      } else {
        setValid((draft) => {
          delete draft[name];
        });
        classList.remove('input_danger');
      }
    };
    if (address) {
      address.addEventListener('blur', handleBlur);
    }
    return () => {
      if (address) {
        address.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  /* handle blur for Business Name */
  useEffect(() => {
    const business = businessNameRef.current;

    const handleBlur = (e) => {
      const { value, classList, name } = e.target;
      if (!value) {
        setValid((draft) => {
          draft[name] = 'please enter business name!';
        });
        classList.add('input_danger');
      } else {
        setValid((draft) => {
          delete draft[name];
        });
        classList.remove('input_danger');
      }
    };
    if (taxInfo.business_type == 1) {
      setValid((draft) => {
        delete draft['business_name'];
      });
    }
    if (business) {
      business.addEventListener('blur', handleBlur);
    }
    return () => {
      if (business) {
        business.removeEventListener('blur', handleBlur);
      }
    };
  }, [taxInfo.business_type]);

  /* handle blur for email items */
  useEffect(() => {
    const email = document.querySelectorAll(`.email_item`);

    const handleBlur = (e) => {
      const { name, value } = e.target;
      if (value === '') {
        setTaxInfo((draft) => {
          draft.email_receive_electronic_invoice[name].error = 'Please fill in your email address';
        });
      } else if (!value.match(/@gmail.com/g)) {
        setTaxInfo((draft) => {
          draft.email_receive_electronic_invoice[name].error = "email don't valid";
        });
      } else {
        setTaxInfo((draft) => {
          draft.email_receive_electronic_invoice[name].error = '';
        });
      }
    };
    if (email) {
      email.forEach((d) => d.addEventListener('blur', handleBlur));
    }
    return () => {
      if (email) {
        email.forEach((d) => d.removeEventListener('blur', handleBlur));
      }
    };
  }, [taxInfo.email_receive_electronic_invoice]);
  return (
    <form className={cx('tax_info_form')} noValidate>
      <div className={cx('form_header')}>
        <div className={cx('form_header_alert', 'd-flex flex-row align-items-center')}>
          <FontAwesomeIcon icon={faExclamation} />
          <p>
            <Translate>tax.note</Translate>
          </p>
        </div>
        <div className={cx('form_header_content', 'd-flex flex-column')}>
          <div className={cx('business_type', 'd-flex flex-row')}>
            <label htmlFor="business_type_option" className="form-label">
              <Translate>pages.seller.register_shop.business_type</Translate>
            </label>
            <div id="business_type_option" className={cx('business_type_option', 'd-flex flex-row')}>
              <RadioList
                data={businessTypeOption}
                titleClass="business_type_item"
                color="primary"
                className={cx('business_type_item')}
                defaultValue={taxInfo?.business_type || 1}
                onClick={handleClickBusinessOption}
              />
            </div>
          </div>
          {taxInfo.business_type !== 1 ? (
            <div className={cx('business_name', 'd-flex flex-row')}>
              <label htmlFor="business_name_content" className="form-label text-capitalize">
                <Translate>tax.business_name</Translate>
              </label>
              <div id="business_name_content" className={cx('business_name_content', 'd-flex flex-column')}>
                <div className={cx('business_name_content_main', 'd-flex flex-column flex-grow-1')}>
                  <FormSearch
                    ref={businessNameRef}
                    title=""
                    name="business_name"
                    useTippy={false}
                    useLabel={false}
                    MaxLength={500}
                    handleOnchange={handleOnchange}
                  >
                    <div className={cx('business_name_length')}>{taxInfo.business_name.length}/500</div>
                  </FormSearch>
                  <MessageDanger message={valid?.business_name} classNames={cx('message')} />
                </div>
                <div className={cx('note')}>
                  <Translate>tax.business_name_note</Translate>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
          <div className={cx('registered_business_address', 'd-flex flex-row')}>
            <label htmlFor="registered_business_address_content" className="form-label">
              <Translate>pages.seller.register_shop.registered_business_address</Translate>
            </label>
            <div
              id="registered_business_address_content"
              className={cx('registered_business_address_content', 'd-flex flex-column')}
            >
              <div className={cx('location')}>
                <Location
                  name="location"
                  data={taxInfo.register_bussiness_address}
                  useLabel={false}
                  ref={locationRef}
                  handlePassLocationValue={handlePassLocationValue}
                />
                <MessageDanger message={valid?.location} classNames={cx('message')} />
              </div>
              <div className={cx('address')}>
                <FormText
                  ref={addressRef}
                  title="address"
                  name="address"
                  data={location?.address}
                  useLabel={false}
                  rows={3}
                  handleOnchange={handleOnchangeAddress}
                />
                <MessageDanger message={valid?.address} classNames={cx('message')} />
              </div>
            </div>
          </div>
          <div className={cx('email_receive_electronic_invoice', 'd-flex flex-row')}>
            <label htmlFor="email_receive_electronic_invoice_content" className="form-label">
              <Translate>pages.seller.register_shop.email_receive_electronic_invoice</Translate>
            </label>
            <div
              id="email_receive_electronic_invoice_content"
              className={cx('email_receive_electronic_invoice_content', 'd-flex flex-column')}
            >
              {Object.entries(taxInfo.email_receive_electronic_invoice).map((dt, index) => (
                <EmailItem
                  handleOnchange={handleOnchangeEmail}
                  dt={dt[1]}
                  key={index}
                  MaxLength={100}
                  handleRemoveEmail={handleRemoveEmail}
                  closeMark={Object.keys(taxInfo.email_receive_electronic_invoice).length > 1 ? true : false}
                />
              ))}
              {Object.keys(taxInfo.email_receive_electronic_invoice).length < 5 ? (
                <Button className={cx('add_email')} type="button" transparent small onClick={handleAddEmail}>
                  <FontAwesomeIcon icon={faPlus} />
                  <div className={cx('add_email_title', 'text-capitalize')}>
                    <Translate>add_email</Translate>
                  </div>
                  <div className={cx('add_email_limit')}>
                    ({Object.keys(taxInfo.email_receive_electronic_invoice).length}/5)
                  </div>
                </Button>
              ) : (
                <></>
              )}
              <div className={cx('note')}>
                <Translate>tax.email_note</Translate>
              </div>
            </div>
          </div>
          <div className={cx('tax_code', 'd-flex flex-row')}>
            <label htmlFor="tax_code_content" className="form-label">
              <Translate>pages.seller.register_shop.tax_code</Translate>
            </label>
            <div id="tax_code_content" className={cx('tax_code_content', 'd-flex flex-column')}>
              <FormSearch
                title=""
                name="tax_code"
                inputType="number"
                maxLength={14}
                containerClass={cx('form-group')}
                useTippy={false}
                useLabel={false}
                handleOnchange={handleOnchange}
              >
                <div className={cx('tax_code_length')}>{taxInfo.tax_code.length}/14</div>
              </FormSearch>
              <div className={cx('note')}>
                <Translate>tax.tax_code_note</Translate>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={cx('form_btn', 'd-flex flex-row justify-content-between text-capitalize')}>
        <Button type="button" small outline onClick={handleBackSettingShipping}>
          <Translate>back</Translate>
        </Button>
        <Button type="button" small primary onClick={handleNextIdentificationInfo}>
          <Translate>next</Translate>
        </Button>
      </div>
    </form>
  );
}
