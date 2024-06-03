import classNames from 'classnames/bind';
import styles from '../Category.module.scss';
import Button from '~/components/Button';
import Tippy from '@tippyjs/react/headless';
import { FormSearch } from '~/layout/Component/FormSearch';
import { useEffect, useState } from 'react';
import { FormSelect } from '~/layout/Component/FormGroup/FormSelect';
import { DeleteData, EditData, GetData } from '~/api/General/HandleData';

const cx = classNames.bind(styles);

export default function ListCat({ handleDelete = () => {}, index, P_id, P_name, P_status, P_parent_id, P_cat_name }) {
  const [parentData, setParentData] = useState(null);
  const [name, setName] = useState(P_name || '');
  const [parentID, setParentID] = useState(P_parent_id || '');
  const [status, setStatus] = useState(P_status || '');
  const [searchParent, setSearchParent] = useState(P_cat_name || '');
  const [showEdit, setShowEdit] = useState(false);
  // show edit cat
  const handleToggleEdit = (e) => {
    setShowEdit(true);
  };

  // hide edit cat
  const handleClickOutside = () => {
    setShowEdit(false);
  };

  const handleEditCat = (e) => {
    e.preventDefault();
    EditData('admin', 'category', P_id, { name: name, parent_id: parentID, status: status })
      .then((result) => {})
      .catch((e) => console.log(e));
  };

  /* handle render width tippy */
  useEffect(() => {
    const t = document.querySelector('.tbody-element');
    const children = document.querySelectorAll('.edit-element');
    if (children) {
      children.forEach((e) => {
        const handleResize = () => {
          e.style.width = `${t.offsetWidth}px`;
        };
        handleResize();
        if (t && children) {
          window.addEventListener('resize', handleResize);
        }
        return () => {
          if (t && children) {
            window.removeEventListener('resize', handleResize);
          }
        };
      });
    }
  });

  /* get cat for edit Cat */
  useEffect(() => {
    /* use show edit to avoid  premature api calls */
    if (showEdit) {
      GetData('admin', 'category', searchParent).then((result) => {
        setParentData(result);
      });
    }
  }, [searchParent, showEdit]);

  //delete cat
  const handleDeleteCat = (e) => {
    DeleteData('admin', 'category', e.target.dataset.id)
      .then((result) => {
        handleDelete(1);
      })
      .catch((e) => console.log(e));
  };

  return (
    <>
      <Tippy
        interactive
        placement="bottom"
        offset={[0, 0]}
        visible={showEdit}
        render={(attrs) => (
          <div className={cx('list_cat_tippy', 'edit-element d-flex flex-column')} tabIndex="-1" {...attrs}>
            <h5 className="text-center text-capitalize">
              <b>Edit Category</b>
            </h5>
            <form className={cx('list_cat_tippy_content', 'd-flex flex-column')} noValidate onSubmit={handleEditCat}>
              <div className="d-flex flex-row flex-wrap">
                <FormSearch
                  title="parent"
                  valueID={parentID}
                  Value={searchParent}
                  data={parentData}
                  searchValue={setSearchParent}
                  handleSetID={setParentID}
                />
                <FormSelect title="status" useStatus={true} defaultValue={status} handleSetValue={setStatus} />
                <FormSearch title="name" Value={name} useTippy={false} searchValue={setName} />
              </div>
              <div className="d-flex flex-row justify-content-center">
                <Button gradient_primary type="submit">
                  Edit
                </Button>
              </div>
            </form>
          </div>
        )}
        onClickOutside={handleClickOutside}
      >
        <tr key={index} className={cx(`tbody-element`)}>
          <td>{P_name}</td>
          <td>{P_cat_name}</td>
          <td>{P_status == 1 ? 'Show' : 'Hide'}</td>
          <td>
            <div className={cx('toll-edit', 'd-flex flex-row justify-content-center flex-wrap')}>
              <Button gradient_primary type="button" onClick={handleToggleEdit}>
                Edit
              </Button>
              <Button data-id={P_id} gradient_danger type="button" onClick={handleDeleteCat}>
                Delete
              </Button>
            </div>
          </td>
        </tr>
      </Tippy>
    </>
  );
}
