import classNames from 'classnames/bind';
import styles from './EditCategory.module.scss';
import Translate from '~/layout/Component/Translate';
import Button from '~/components/Button';
import { useImmer } from 'use-immer';
import { useEffect, useState } from 'react';
import CloseIcon from '~/layout/Component/Icon/CloseIcon';
import SearchCat from './SearchCat';
import { Fragment } from 'react';
import ArrowRightIcon from '~/layout/Component/Icon/ArrowRightIcon';

const cx = classNames.bind(styles);

export default function EditCategory({
  data,
  onToggle = () => {},
  handleSearchCat = () => {},
  handlePassData = () => {},
}) {
  const [selectCat, setSelectCat] = useImmer({});
  const [selected, setSelected] = useImmer({});

  const [disabled, setDisabled] = useState(false);
  const handleConfirmSelectCat = (e) => {
    handlePassData(selected);
    onToggle('close');
  };

  const handleSelectCat = (e) => {
    const { id, level, index } = e.currentTarget.dataset;
    const item = document.querySelectorAll(`.${level}`);
    for (let i = 0; i < item.length; i++) {
      if (item[i].classList.contains('active_cat')) {
        item[i].classList.remove('active_cat');
        break;
      }
    }
    if (selectCat[level].filter((d) => d.id === parseInt(id) && d.children_recursives.length !== 0).length === 0) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }

    selectCat[level].map((d) => {
      if (d.id === parseInt(id)) {
        setSelectCat((draft) => {
          for (let i = parseInt(index) + 3; i < 9; i++) {
            if (!draft[`level_${i}`]) {
              break;
            }
            delete draft[`level_${i}`];
          }
          draft[`level_${parseInt(index) + 2}`] = d.children_recursives;
        });
      }
    });

    setSelected((draft) => {
      for (let i = parseInt(index) + 1; i < 9; i++) {
        if (!draft[i]) {
          break;
        }
        delete draft[i];
      }
      draft[`${parseInt(index)}`] = parseInt(id);
    });
    e.currentTarget.classList.add('active_cat');
  };
  useEffect(() => {
    if (data) {
      setSelectCat((draft) => {
        draft['level_1'] = data.filter((x) => x.parent_id === null);
      });
    }
  }, [data]);
  return (
    <section
      id="edit_category"
      className={cx('wrapper', 'd-flex flex-column justify-content-center align-items-center')}
    >
      <div className={cx('contain')}>
        <div className={cx('header', 'd-flex flex-row justify-content-between align-items-center')}>
          <h4 className="text-capitalize">
            <Translate>edit_category</Translate>
          </h4>
          <Button
            onClick={() => {
              onToggle('close');
            }}
            type="button"
            none_size
            transparent
          >
            <CloseIcon />
          </Button>
        </div>
        {data && Object.keys(selectCat).length !== 0 && (
          <Fragment>
            <div className={cx('main')}>
              <div className={cx('main_container', 'd-flex flex-column')}>
                <div className={cx('title', 'd-flex flex-row justify-content-between align-items-center')}>
                  <SearchCat searchValue={handleSearchCat} />
                  <div className={cx('note', 'd-flex flex-row align-items-center')}>
                    <span>
                      <Translate>pages.seller.add_product.edit_cat.note.one</Translate>,
                    </span>
                    <Button none_size transparent to="/education">
                      <Translate>pages.seller.add_product.edit_cat.note.two</Translate>
                    </Button>
                  </div>
                </div>
                <div className={cx('content', 'd-flex flex-row')}>
                  {Object.entries(selectCat).map(([key, value], index) => (
                    <ul className={cx('cat_wrapper', 'd-flex flex-column')} key={index}>
                      {value?.map((data) => (
                        <li
                          className={cx(
                            'cat_items',
                            key + ' d-flex flex-row justify-content-between align-items-center',
                          )}
                          data-index={index}
                          key={data?.id}
                          onClick={handleSelectCat}
                          data-id={data.id}
                          data-level={key}
                        >
                          <p>{data.categories_translation[0].name}</p>
                          {data?.children_recursives?.length > 0 && <ArrowRightIcon />}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          </Fragment>
        )}
        <div className={cx('footer', 'd-flex flex-row justify-content-between')}>
          <div className={cx('category_selected', 'd-flex flex-row align-items-center')}>
            <span>
              <Translate>selected</Translate> :
            </span>
            <span className={cx('no_select')}>
              <Translate>no_select_category</Translate>
            </span>
            {/* <div className={cx('cat_selected_item')}></div> */}
          </div>
          <div className={cx('btn', 'd-flex flex-row')}>
            <Button
              onClick={() => {
                onToggle('close');
              }}
              type="button"
              small
              outline
            >
              <Translate>cancel</Translate>
            </Button>
            <Button onClick={handleConfirmSelectCat} type="button" small disabled={!disabled} primary>
              <Translate>confirm</Translate>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
