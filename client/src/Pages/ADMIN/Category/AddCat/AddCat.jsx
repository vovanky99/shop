import classNames from 'classnames/bind';
import { Fragment, useEffect, useRef, useState } from 'react';

import { CreateData } from '~/api/General/HandleData';
import Category from '~/layout/Component/Category';
import MessageDanger from '~/layout/Component/Message/MessageDanger';
import MessageSuccess from '~/layout/Component/Message/MessageSuccess';
import styles from '~/pages/ADMIN/Category/Category.module.scss';
import { FormSearch } from '~/layout/Component/FormSearch';
import Button from '~/components/Button';
import Modal from '~/layout/Component/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useImmer } from 'use-immer';
import Translate from '~/layout/Component/Translate';
import MessageText from '~/layout/Component/Message/MessageText';
import Images from '~/components/Images';
import Progress from '~/components/Progress';
import CldUploadImg, { DeleteImageCld } from '~/services/cloudinary/CldUploadImg';

const cx = classNames.bind(styles);

export default function AddCat({ handleReloadData = () => {}, handleClose, language, addClass, closeModal }) {
  const nameEnRef = useRef();
  const nameViRef = useRef();
  const fileImageRef = useRef();
  const message = {
    name_vi: Translate({ children: 'valid.name_vi' }),
    name_en: Translate({ children: 'valid.name_en' }),
    success: Translate({ children: 'message.create_cat_success' }),
    error: Translate({ children: 'message.create_cat_error' }),
    category_exists: Translate({ children: 'valid.category_exists' }),
    image_exists: Translate({ children: 'valid.image_exists' }),
  };
  const [valid, setValid] = useImmer({});
  const [addCat, setAddCat] = useImmer({
    name_vi: '',
    name_en: '',
    parent_id: '',
    industry_code: '',
    images_cat: {
      images_0: {
        data: '',
        local: '',
        progress: '',
      },
      images_1: {
        data: '',
        local: '',
        progress: '',
      },
      images_2: {
        data: '',
        local: '',
        progress: '',
      },
      images_3: {
        data: '',
        local: '',
        progress: '',
      },
      images_4: {
        data: '',
        local: '',
        progress: '',
      },
      images_5: {
        data: '',
        progress: '',
        local: '',
      },
    },
  });
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');

  const handleOnchange = (e) => {
    const { value, name } = e.target;
    setAddCat((draft) => {
      draft[name] = value;
    });
  };

  const handleSetParentID = (e) => {
    const { id } = e.currentTarget.dataset;
    setAddCat((draft) => {
      draft.parent_id = id;
    });
  };

  const handleSelectMultipleImages = (e) => {
    const Image = fileImageRef.current;
    Image.click();
  };

  /* handle for upload images to cloudinary */

  const handleUploadProgress = (event) => {
    const { loaded, total } = event;
    const percent = Math.round((loaded * 100) / total);
    setAddCat((draft) => {
      for (let i = 0; i <= Object.keys(draft.images_cat).length - 1; i++) {
        const key = `images_${i}`;
        if (!addCat.images_cat[key]['data']) {
          draft.images_cat[key]['progress'] = percent;
          break;
        }
      }
    });
  };

  const uploadFile = (file, reader) => {
    try {
      CldUploadImg(file, handleUploadProgress)
        .then((result) => {
          if (result) {
            setAddCat((draft) => {
              for (let i = 0; i <= Object.keys(draft.images_cat).length - 1; i++) {
                const key = `images_${i}`;
                if (draft.images_cat[key]['local'] === reader) {
                  draft.images_cat[key]['data'] = result;
                  draft.images_cat[key]['progress'] = 0;
                  break;
                }
              }
            });
          }
        })
        .catch((e) => console.log(e));
    } catch (e) {
      console.log(e);
    }
  };

  const handleUploadImages = (e) => {
    let { files, value } = e.target;
    let imageExists = false;

    Object.entries(files).forEach(([key, value]) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setAddCat((draft) => {
          for (let i = 0; i <= Object.keys(draft.images_cat).length - 1; i++) {
            if (draft.images_cat[`images_${i}`]['local'] === '') {
              draft.images_cat[`images_${i}`]['local'] = reader.result;
              break;
            }
            if (draft.images_cat[`images_${i}`]['local'] === reader.result) {
              imageExists = true;
              break;
            }
          }
        });
        if (imageExists) {
          return;
        }
        uploadFile(value, reader.result);
      };
      if (value) {
        reader.readAsDataURL(value);
      }
    });
    if (!imageExists) {
      setValid((draft) => {
        delete draft['images_cat'];
      });
    } else {
      setValid((draft) => {
        draft['images_cat'] = message.image_exists;
      });
    }
    // Clear the input value to allow the same file to be selected again
    value = '';
  };
  const handleCloseImages = (e) => {
    const { name, public_id } = e.currentTarget.dataset;
    if (public_id) {
      DeleteImageCld(public_id)
        .then((result) => {
          if (result) {
            setAddCat((draft) => {
              draft.images_cat[name] = {
                data: '',
                local: '',
                progress: '',
              };
            });
          }
        })
        .catch((e) => console.log(e));
    }
  };

  const validate = async (field = addCat) => {
    const messageError = { ...valid };
    if ('name_vi' in field) {
      messageError.name_vi = !field.name_vi ? message.name_vi : '';
    }
    if (field === addCat) {
      Object.entries(messageError).map(([key, value]) => {
        if (value === '') {
          delete messageError[key];
          if (key === 'name_vi') {
            nameViRef.current.classList.remove('input_danger');
          }
          if (key === 'name_en') {
            nameEnRef.current.classList.remove('input_danger');
          }
        } else {
          setValid((draft) => {
            draft[key] = value;
          });
          if (key === 'name_vi') {
            nameViRef.current.classList.add('input_danger');
          }
          if (key === 'name_en') {
            nameEnRef.current.classList.add('input_danger');
          }
        }
      });
    }
    return messageError;
  };

  /* function handle create category */
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const val = await validate();
    if (addCat.name_en && addCat.name_vi && Object.keys(val).length === 0) {
      setCreateSuccess('');
      setCreateError('');
      const data = new FormData();
      let images = [];
      //handle data for create
      Object.entries(addCat).map(([key, value]) => {
        if (typeof value !== 'object') {
          data.append(key, value);
        } else {
          Object.entries(value).map(([key, value]) => {
            if (typeof value === 'object' && value.data !== '') {
              images.push(value.data.url);
            }
          });
        }
      });
      data.append('images', images);
      CreateData('admin', 'category', data)
        .then((result) => {
          if (result.success) {
            setCreateSuccess(message.success);
            handleReloadData(1);
            setAddCat((draft) => {
              Object.entries(draft.images_cat).map(([key, value]) => {
                draft.images_cat[key].data = '';
                draft.images_cat[key].progress = '';
                draft.images_cat[key].local = '';
              });
              draft.name_en = '';
              draft.name_vi = '';
            });
          } else {
            setCreateSuccess('');
            setCreateError(message.category_exists);
          }
        })
        .catch((e) => {
          console.log(e);
          setCreateError(message.error);
        });
    }
  };

  useEffect(() => {
    if (!closeModal) {
      setCreateError('');
      setCreateSuccess('');
    }
  }, [closeModal]);
  return (
    <Modal closeModal={closeModal}>
      <div className={cx('add_category')} tabIndex="-1">
        <div className={cx('add_cat_header', 'd-flex flex-row justify-content-between')}>
          <h4 className="text-center text-capitalize">
            <b>
              <Translate>category</Translate>
            </b>
          </h4>
          <div className={cx('close')}>
            <FontAwesomeIcon icon={faClose} onClick={handleClose} />
          </div>
        </div>
        <form onSubmit={handleCreateCategory} className={cx('form_add_cat', 'd-flex flex-row flex-wrap')} noValidate>
          <div className={cx('cat_parent', 'd-flex flex-column')}>
            <Category
              title="cat_parent"
              classTitle="add_cat_parent"
              name="parent_id"
              useColumn
              handleOnclick={handleSetParentID}
              language={language}
            />
          </div>
          <div className={cx('name_vi')}>
            <FormSearch
              ref={nameViRef}
              title="name_vi"
              name="name_vi"
              useColumn
              useTippy={false}
              handleOnchange={handleOnchange}
            />
          </div>
          <div className={cx('name_en')}>
            <FormSearch
              ref={nameEnRef}
              title="name_en"
              name="name_en"
              useColumn
              useTippy={false}
              handleOnchange={handleOnchange}
            />
          </div>
          <div className={cx('industry_code')}>
            <FormSearch
              ref={nameEnRef}
              title="industry_code"
              name="industry_code"
              useColumn
              useTippy={false}
              handleOnchange={handleOnchange}
            />
            <MessageText className={cx('message', 'text-capitalize')} message={valid?.industry_code} />
          </div>
          <div className={cx('images_category')}>
            <h4 className="text-capitalize">
              <Translate>category_images</Translate>
            </h4>
            <div className={cx('images_category_content', 'd-flex flex-column')}>
              <div className={cx('all_images', 'd-flex flex-column')}>
                <div className={cx('all_images_content', 'd-flex flex-row')}>
                  {Object.entries(addCat.images_cat).map(([key, value]) => {
                    if (value?.data || value?.local) {
                      return (
                        <div className={cx('images_container')} key={key}>
                          <div className={cx('img')}>
                            <Images src={value?.data?.url || value?.local} alt={value?.data?.url || value?.local} />
                          </div>
                          <Progress data={value?.progress} />
                          <Button className={cx('close')} transparent none_size type="button">
                            <FontAwesomeIcon
                              icon={faClose}
                              onClick={handleCloseImages}
                              data-name={key}
                              data-public_id={value?.data?.public_id}
                            />
                          </Button>
                        </div>
                      );
                    }
                  })}
                  {Object.values(addCat.images_cat).filter((d) => d.data !== '').length !== 6 ? (
                    <div
                      data-type="btn_upload"
                      className={cx('select_images', 'd-flex flex-row justify-content-center')}
                    >
                      <input
                        ref={fileImageRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleUploadImages}
                        multiple
                      />
                      <Button
                        className={cx('btn_select_image', 'text-capitalize')}
                        transparent
                        type="button"
                        onClick={handleSelectMultipleImages}
                      >
                        <Translate>select_image</Translate>
                      </Button>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
                <MessageText
                  className={cx('message', 'text-capitalize text-center text-danger')}
                  message={valid?.images_cat}
                />
              </div>
            </div>
          </div>
          <div className={cx('message')}>
            <MessageSuccess message={createSuccess} />
            <MessageDanger message={createError} />
          </div>
          <div className="text-center flex-grow-1">
            <Button className="text-capitalize" type="submit" small gradient_primary>
              <Translate>create</Translate>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
