import classNames from 'classnames/bind';
import { Button, Image } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

import styles from './SlideShow.module.scss';
import ShowHighLight from './SlideHighLight';

const cx = classNames.bind(styles);

export default function Slide({
  data,
  changeSrcHL,
  srcHL,
  srcHighlightParent,
  wrapper,
  Highlight,
  numberShow = 5,
  title,
}) {
  const [highlight, setHighlight] = useState('');
  const [showHighlight, setShowHighlight] = useState(false);
  const [slideStart, setSlideStart] = useState(0);
  const [slideEnd, setSlideEnd] = useState(numberShow);
  const [imageHighlight, setImagesHighlight] = useState('');
  const [srcHighlight, setSrcHighlight] = useState(data[0].title);
  let setDefaultHL = srcHL;
  let defaultSrcHighlight = '';
  if (setDefaultHL != '') {
    defaultSrcHighlight = setDefaultHL;
  } else {
    defaultSrcHighlight = srcHighlight;
  }
  const HandleHighlightShow = () => {
    setShowHighlight(true);
  };
  const srcHighlightChild = srcHighlightParent;
  const datas = data.slice(slideStart, slideEnd);
  const lenght = data.length;
  const handleNext = () => {
    if (slideEnd < lenght) {
      setSlideStart(slideStart + 1);
      setSlideEnd(slideEnd + 1);
    }
  };
  const handlePrev = () => {
    if (slideStart > 0) {
      setSlideStart(slideStart - 1);
      setSlideEnd(slideEnd - 1);
    }
  };
  const handleOnMouse = (e) => {
    setSrcHighlight(e.currentTarget.src);
    changeSrcHL('');
  };
  // onclick show details hl
  useEffect(() => {
    let imgs = document.querySelectorAll('.img-click');
    let imgsHighlight = document.querySelector('.src-highlight');
    let body = document.querySelector('body');
    const handleOnclickShow = (e) => {
      setImagesHighlight(e.currentTarget.src);
      setShowHighlight(true);
      body.style['overflow'] = 'hidden';
    };
    if (imgsHighlight) {
      imgsHighlight.addEventListener('click', handleOnclickShow);
    }
    if (imgs) {
      imgs.forEach((el) => el.addEventListener('click', handleOnclickShow));
    }
    return () => {
      if (imgsHighlight) {
        imgsHighlight.removeEventListener('click', handleOnclickShow);
      }
      if (imgs) {
        imgs.forEach((el) => el.removeEventListener('click', handleOnclickShow));
      }
    };
  }, []);
  const changeSetShowHighlight = (vl) => {
    setShowHighlight(vl);
  };
  return (
    <section className={cx('wrapper', 'd-flex flex-column ' + wrapper)}>
      {showHighlight && (
        <ShowHighLight
          changeSetShowHighlight={changeSetShowHighlight}
          dt={data}
          title={title}
          imageHighlight={imageHighlight}
        />
      )}
      <div className={cx('highlight', ' ' + Highlight)} onClick={HandleHighlightShow}>
        <picture>
          <Image
            className={cx('src-highlight')}
            src={srcHighlightChild != '' ? srcHighlightParent : defaultSrcHighlight}
            style={{ width: '100%' }}
          />
        </picture>
      </div>
      <div className={cx('slide-show', 'd-flex flex-row')}>
        <button className={cx('left')} onClick={handlePrev}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        {datas.map((d, key) => (
          <div className={cx('container-img')} key={key}>
            <picture>
              {srcHighlight == d.title ? (
                <Image
                  onMouseOver={handleOnMouse}
                  src={d.title}
                  style={{ width: '100%', cursor: 'pointer' }}
                  className={cx('img-click', 'images_active')}
                />
              ) : (
                <Image
                  onMouseOver={handleOnMouse}
                  src={d.title}
                  className={cx('img-click')}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              )}
            </picture>
          </div>
        ))}
        <button className={cx('next', '')} onClick={handleNext}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </section>
  );
}
