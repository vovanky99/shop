import { Fragment, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import { useImmer } from 'use-immer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from '../RegisterShop.module.scss';
import Button from '~/components/Button';
import LocalStorageService from '~/services/LocalStorageService';
import { faExclamation, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FormSearch } from '~/layout/Component/FormSearch';
import Images from '~/components/Images';
import Checkbox from '~/components/Checkbox';
import CldUploadImg from '~/services/cloudinary/CldUploadImg';
import MessageText from '~/layout/Component/Message/MessageText';
import Progress from '~/components/Progress';
import { RegisterShop } from '~/api/Seller/Profile';
import Translate from '~/layout/Component/Translate';
import RadioList from '~/layout/Component/RadioList';

const cx = classNames.bind(styles);

export default function IdentityInfo({ seller }) {
  const checkPoliciesRef = useRef();
  const identityNumberRef = useRef();
  const fullnameRef = useRef();
  const sellerIdentity = seller?.identity_info[0];
  const identityRadioTittle = [
    { type: 1, title: 'citizen_identification_card' },
    { type: 2, title: 'id_card' },
    { type: 3, title: 'passport' },
  ];
  const [valid, setValid] = useImmer({});
  const [identityInfo, setIdentityInfo] = useImmer({
    form_of_identity: sellerIdentity?.type || 1,
    identity_number: sellerIdentity?.identity_number || '',
    fullname: sellerIdentity?.fullname || '',
    upload_identity_images: sellerIdentity?.identity_image || '',
    upload_identity_hold_images: sellerIdentity?.identity_hold_image || '',
    check_policies: 0,
  });
  const [uploadProgress, setUploadProgress] = useImmer({
    upload_identity_images: 0,
    upload_identity_hold_images: 0,
  });
  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setIdentityInfo((draft) => {
      draft[name] = value;
    });
  };

  const validate = (field = identityInfo) => {
    const messageError = { ...valid };
    if ('identity_number' in field) {
      messageError.identity_number = !field.identity_number ? 'Please enter your identity!' : '';
    }
    if ('fullname' in field) {
      messageError.fullname = !field.fullname ? 'Please enter your full name!' : '';
    }
    if ('upload_identity_images' in field) {
      messageError.identity_images = !field.upload_identity_images ? 'Please select image!' : '';
    }
    if ('upload_identity_hold_images' in field) {
      messageError.identity_hold_images = !field.upload_identity_hold_images ? 'Please select image!' : '';
    }
    if ('check_policies' in field) {
      messageError.checked = field.check_policies !== 1 ? 'Please tick the checkbox above to continue!' : '';
    }
    if (field === identityInfo) {
      Object.entries(messageError).map(([key, value]) => {
        if (value === '') {
          delete messageError[key];
        }
      });
    }
    setValid({ ...messageError });
    return messageError;
  };

  const handleBackTaxInfo = (e) => {
    const stepsRegister = document.querySelectorAll('.steps_register');
    const taxContent = document.getElementById('tax_info_content');
    const identificationInfoContent = document.getElementById('identification_info_content');
    if (!sellerIdentity && stepsRegister && taxContent && identificationInfoContent) {
      for (let i = 0; i < stepsRegister.length; i++) {
        if (stepsRegister[i].getAttribute('id') === 'tax_info') {
          stepsRegister[i].classList.add('active');
          stepsRegister[i].classList.remove('finished');
          stepsRegister[i + 1].classList.remove('active');
          taxContent.classList.add('active');
          identificationInfoContent.classList.remove('active');
          LocalStorageService.setItem('taxInfo', true);
          LocalStorageService.removeItem('IdentificationInfo');
        }
      }
    }
  };
  const handleNextCompleted = (e) => {
    const completedContent = document.getElementById('completed_content');
    const identityInfoContent = document.getElementById('identification_info_content');
    const stepsRegister = document.querySelectorAll('.steps_register');
    const val = validate();
    if (
      Object.keys(val).length === 0 &&
      Object.values(identityInfo).filter((d) => d === '').length === 0 &&
      identityInfo.check_policies === 1
    ) {
      // handle submit tax info
      const taxinfo = LocalStorageService.getItem('taxInfoValue');
      if (taxinfo) {
        let new_value = [];
        Object.values(taxinfo.email_receive_electronic_invoice).map((d) => {
          new_value.push(d.value);
        });
        const formTax = new FormData();
        formTax.append('business_name', taxinfo.business_name);
        formTax.append('business_type', taxinfo.business_type);
        formTax.append('ward_id', taxinfo.register_bussiness_address.ward_id);
        formTax.append('address', taxinfo.register_bussiness_address.address);
        formTax.append('tax_code', taxinfo.tax_code);
        formTax.append('email', new_value);
        RegisterShop(formTax, 'tax_info')
          .then((result) => {})
          .catch((e) => console.log(e));
      }

      // handle submit identity info
      const formIdentity = new FormData();
      formIdentity.append('form_of_identity', identityInfo.form_of_identity);
      formIdentity.append('identity_number', identityInfo.identity_number);
      formIdentity.append('fullname', identityInfo.fullname);
      formIdentity.append('upload_images', identityInfo.upload_identity_images);
      formIdentity.append('upload_hold_images', identityInfo.upload_identity_hold_images);
      RegisterShop(formIdentity, 'identity_info')
        .then((result) => {
          if (result.success) {
            for (let i = 0; i < stepsRegister.length; i++) {
              if (stepsRegister[i].getAttribute('id') === 'completed') {
                stepsRegister[i].classList.add('active');
                stepsRegister[i - 1].classList.remove('active');
                stepsRegister[i - 1].classList.add('finished');
                identityInfoContent.classList.remove('active');
                completedContent.classList.add('active');
                LocalStorageService.removeItem('taxInfoValue');
                LocalStorageService.removeItem('settingShipValue');
              }
            }
          }
        })
        .catch((e) => console.log(e));
    }
  };

  /* handle remove active for Form of identification radio when select other radio */
  const handleSelectIdentityContent = (e) => {
    const { type, color } = e.currentTarget.dataset;

    setIdentityInfo((draft) => {
      draft.form_of_identity = parseInt(type);
    });
    setValid((draft) => {
      delete draft.identity_number;
    });
    identityNumberRef.current.classList.remove('input_danger');
  };

  /*set default value for radio identity form of identification */
  useEffect(() => {
    const radioItem = document.querySelectorAll('.form_of_identity_content_item');
    for (let i = 0; i < radioItem.length; i++) {
      if (parseInt(radioItem[i].dataset.type) === identityInfo.form_of_identity) {
        radioItem[i].classList.add(`radio_${radioItem[i].dataset.color}_active`);
      }
    }
  }, []);

  /* handle upload identity images */
  useEffect(() => {
    const images = document.querySelectorAll('.upload_identity');
    const handleOnchange = (e) => {
      const { name } = e.target;
      const form = new FormData();
      form.append('file', e.target.files[0]);
      const reader = new FileReader();
      const handleUploadProgress = (e) => {
        const progress = Math.round((e.loaded * 100) / e.total);
        setUploadProgress((draft) => {
          draft[name] = progress;
        });
      };
      if (e.target.files[0]) {
        reader.onload = (e) => {
          setIdentityInfo((draft) => {
            draft[name] = e.target.result;
          });
          CldUploadImg(form, handleUploadProgress)
            .then((result) => {
              setIdentityInfo((draft) => {
                draft[name] = result.url;
              });
            })
            .catch((e) => console.log(e));
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };

    if (images) {
      images.forEach((d) => d.addEventListener('change', handleOnchange));
    }
    return () => {
      if (images) {
        images.forEach((d) => d.removeEventListener('change', handleOnchange));
      }
    };
  }, []);

  /* validate when blur identity number  */
  useEffect(() => {
    const identity = identityNumberRef.current;
    const handleBlur = (e) => {
      const { value, name, classList } = e.target;
      if (!value) {
        setValid((draft) => {
          draft[name] = 'Please enter your identity!';
        });
        classList.add('input_danger');
      } else {
        setValid((draft) => {
          delete draft[name];
        });
        classList.remove('input_danger');
      }
    };
    if (identity) {
      identity.addEventListener('blur', handleBlur);
    }
    return () => {
      if (identity) {
        identity.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  /* validate when blur fullname  */
  useEffect(() => {
    const fullname = fullnameRef.current;
    const handleBlur = (e) => {
      const { value, name, classList } = e.target;
      if (!value) {
        setValid((draft) => {
          draft[name] = 'Please enter your full name!';
        });
        classList.add('input_danger');
      } else {
        setValid((draft) => {
          delete draft[name];
        });
        classList.remove('input_danger');
      }
    };
    if (fullname) {
      fullname.addEventListener('blur', handleBlur);
    }
    return () => {
      if (fullname) {
        fullname.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  /* handle select identity image */
  useEffect(() => {
    const uploadItem = document.querySelectorAll('.upload_item');
    const handleClick = (e) => {
      e.stopPropagation();
      const { parentNode } = e.currentTarget;

      if (parentNode) {
        parentNode.getElementsByTagName('input')[0].click();
      }
    };
    if (uploadItem) {
      uploadItem.forEach((d) => d.addEventListener('click', handleClick));
    }
    return () => {
      if (uploadItem) {
        uploadItem.forEach((d) => d.removeEventListener('click', handleClick));
      }
    };
  }, []);

  /* handle delete identity image */
  useEffect(() => {
    const deleteImage = document.querySelectorAll('.delete_image');
    const handleClick = (e) => {
      e.stopPropagation();
      const { name } = e.currentTarget.dataset;
      setIdentityInfo((draft) => {
        draft[name] = '';
      });
      setUploadProgress((draft) => {
        draft[name] = 0;
      });
    };
    if (deleteImage) {
      deleteImage.forEach((d) => d.addEventListener('click', handleClick));
    }
    return () => {
      if (deleteImage) {
        deleteImage.forEach((d) => d.removeEventListener('click', handleClick));
      }
    };
  }, []);

  /* handle validate check policies */
  useEffect(() => {
    const checkItem = document.querySelector('.check_item');
    if (checkItem) {
      if (identityInfo.check_policies === 1) {
        checkItem.checked = true;
      }
    }
    const handleClick = (e) => {
      if (e.target.checked) {
        setValid((draft) => {
          delete draft.checked;
        });
        setIdentityInfo((draft) => {
          draft.check_policies = 1;
        });
      } else {
        setIdentityInfo((draft) => {
          draft.check_policies = 0;
        });
        setValid((draft) => {
          draft.checked = 'Please tick the checkbox above to continue';
        });
      }
    };
    if (checkItem) {
      checkItem.addEventListener('click', handleClick);
    }
    return () => {
      if (checkItem) {
        checkItem.removeEventListener('click', handleClick);
      }
    };
  }, []);
  return (
    <Fragment>
      <form className={cx('identity_info_form')}>
        <div className={cx('form_header')}>
          <div className={cx('form_header_alert', 'd-flex flex-row align-items-center')}>
            <FontAwesomeIcon icon={faExclamation} />
            <p>
              <Translate>identity.note</Translate>
            </p>
          </div>
          <div className={cx('form_header_content', 'd-flex flex-column')}>
            <div className={cx('form_of_identity', 'd-flex flex-row')}>
              <label className={cx('form-label')}>
                <Translate>pages.seller.register_shop.form_of_identification</Translate>
              </label>
              <div className={cx('form_of_identity_content', 'd-flex flex-row')}>
                <RadioList
                  data={identityRadioTittle}
                  className={cx('form_of_identity_content_item')}
                  titleClass="form_of_identity_content_item"
                  color="primary"
                  defaultValue={identityInfo?.form_of_identity}
                  onClick={handleSelectIdentityContent}
                />
              </div>
            </div>
            <div className={cx('identity_number', 'd-flex flex-row')}>
              <label className="form-label">
                {identityInfo.form_of_identity === 1 ? (
                  <Translate>citizen_identification_card</Translate>
                ) : identityInfo.form_of_identity === 2 ? (
                  <Translate>id_card</Translate>
                ) : (
                  <Translate>passport</Translate>
                )}
              </label>
              <div className={cx('identity_number_content')}>
                <FormSearch
                  ref={identityNumberRef}
                  title=""
                  Value={identityInfo.identity_number}
                  name="identity_number"
                  inputType={identityInfo.form_of_identity === 3 ? 'text' : 'number'}
                  useLabel={false}
                  useTippy={false}
                  handleOnchange={handleOnchange}
                >
                  <div className={cx('identity_item_length')}>
                    {Object.values(identityInfo.identity_number).length}/
                    {identityInfo.form_of_identity !== 3 ? '12' : '20'}
                  </div>
                </FormSearch>
                <MessageText message={valid?.identity_number} className={cx('message', 'text-danger')} />
              </div>
            </div>
            <div className={cx('fullname', 'd-flex flex-row')}>
              <label className="form-label text-capitalize">
                <Translate>full_name</Translate>
              </label>
              <div className={cx('fullname_content')}>
                <div className={cx('fullname_content_header')}>
                  <FormSearch
                    ref={fullnameRef}
                    title=""
                    name="fullname"
                    Value={identityInfo.fullname}
                    useLabel={false}
                    useTippy={false}
                    handleOnchange={handleOnchange}
                  >
                    <div className={cx('identity_item_length')}>{Object.values(identityInfo.fullname).length}/100</div>
                  </FormSearch>
                  <MessageText message={valid?.fullname} className={cx('message', 'text-danger')} />
                </div>
                <div className={cx('note')}>
                  <Translate>pages.seller.register_shop.fullname_note</Translate>
                </div>
              </div>
            </div>
            <div className={cx('photo_of_identity', 'd-flex flex-row')}>
              <label className="form-label">
                <Translate>pages.seller.register_shop.photo_of_id</Translate>
              </label>
              <div className={cx('photo_of_identity_content')}>
                <div className={cx('content_header', 'd-flex flex-row align-items-end')}>
                  <div className={cx('upload_identity_images')}>
                    <div
                      className={cx(
                        'layer_interface',
                        ' upload_item d-flex flex-row align-items-center justify-content-center',
                      )}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </div>
                    <div className={cx('images')}>
                      <Images src={identityInfo.upload_identity_images} alt={identityInfo.upload_identity_images} />
                      <div className={cx('trash_can')}>
                        <FontAwesomeIcon
                          className="delete_image"
                          icon={faTrashCan}
                          data-name="upload_identity_images"
                        />
                      </div>
                      <Progress data={uploadProgress.upload_identity_images} />
                    </div>
                    <input
                      type="file"
                      name="upload_identity_images"
                      accept="image/*"
                      className={cx('upload_identity')}
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <Images
                      src={require('~/assets/images/Seller/RegisterShop/photo_of_identity.png')}
                      alt={require('~/assets/images/Seller/RegisterShop/photo_of_identity.png')}
                    />
                  </div>
                </div>
                <MessageText message={valid?.identity_images} className={cx('message', 'text-danger')} />
                <div className={cx('note')}>
                  <Translate>pages.seller.register_shop.photo_note</Translate>
                </div>
              </div>
            </div>
            <div className={cx('photo_hold_your_identity', 'd-flex flex-row')}>
              <label className="form-label">
                <Translate>pages.seller.register_shop.photo_of_id</Translate>
              </label>
              <div className={cx('photo_hold_your_identity_content')}>
                <div className={cx('content_header', 'd-flex flex-row align-items-end')}>
                  <div className={cx('upload_identity_images')}>
                    <div
                      className={cx(
                        'layer_interface',
                        'upload_item d-flex flex-row align-items-center justify-content-center',
                      )}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </div>
                    <div className={cx('images')}>
                      <Images
                        src={identityInfo.upload_identity_hold_images}
                        alt={identityInfo.upload_identity_hold_images}
                      />
                      <div className={cx('trash_can')}>
                        <FontAwesomeIcon
                          className="delete_image"
                          icon={faTrashCan}
                          data-name="upload_identity_hold_images"
                        />
                      </div>
                      <Progress data={uploadProgress.upload_identity_hold_images} />
                    </div>
                    <input
                      type="file"
                      name="upload_identity_hold_images"
                      onChange={() => {}}
                      accept="image/*"
                      className={cx('upload_identity')}
                    />
                  </div>
                  <div>
                    <Images
                      src={require('~/assets/images/Seller/RegisterShop/photo_hold_your_identity.png')}
                      alt={require('~/assets/images/Seller/RegisterShop/photo_hold_your_identity.png')}
                    />
                  </div>
                </div>
                <MessageText message={valid?.identity_hold_images} className={cx('message', 'text-danger')} />
                <div className={cx('note')}>
                  <Translate>pages.seller.register_shop.photo_hold_note</Translate>
                </div>
              </div>
            </div>
            <div className={cx('check_policies', 'd-flex flex-column')}>
              <div className={cx('check_policies_container')}>
                <Checkbox
                  ref={checkPoliciesRef}
                  requir={false}
                  className={cx('check_policies_content')}
                  checkboxclass={cx('check_item')}
                  Label={Translate({ children: 'pages.seller.register_shop.policy_note' })}
                />
              </div>
              <MessageText message={valid?.checked} className={cx('message', 'text-danger')} />
            </div>
          </div>
        </div>
        <div className={cx('form_btn', 'd-flex flex-row justify-content-between text-capitalize')}>
          <Button type="button" small outline onClick={handleBackTaxInfo} disabled={sellerIdentity ? true : false}>
            <Translate>back</Translate>
          </Button>
          <Button type="button" small primary onClick={handleNextCompleted}>
            <Translate>next</Translate>
          </Button>
        </div>
      </form>
    </Fragment>
  );
}
