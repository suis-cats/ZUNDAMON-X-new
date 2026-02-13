import { FC, useEffect, useState } from 'react';
import { emotionType } from '../types';
import character_image_path from '../character_image_path.json';
import { is } from 'date-fns/locale';
type Props = {
  emotionType: emotionType;
  isMouseOpen: boolean;
  comment: string;
  selectedCharactor: string;
};

const ZundamonModel: FC<Props> = ({
  isMouseOpen,
  comment,
  emotionType,
  selectedCharactor: selectedCharacter,
}) => {
  const [isAnimation, setIsAnimation] = useState<boolean>(false);
  useEffect(() => {
    console.log('animate');
    setIsAnimation(true);
    setTimeout(() => {
      setIsAnimation(false);
    }, 200);
  }, [comment, emotionType]);
  // voice_stye_dataから画像のパスを取得
  const getImageUrl = () => {
    const tmp = (
      character_image_path as {
        [keys: string]: {
          [keys: string]: string;
        };
      }
    ).characterImages[selectedCharacter];
    return tmp;
  };
  return (
    <div
      style={{
        width: '1000px',
        height: '100px',
        position: 'absolute',
        top: -120,
        right: 0,
      }}
    >
      {comment !== '' && (
        <div
          style={{
            padding: '12px',
            border: '2px solid black',
            borderRadius: '12px',
            position: 'absolute',
            bottom: '50px',
            right: '200px',
            backgroundColor: 'white',
            zIndex: 100,
            fontWeight: 'bold',
            maxWidth: '700px',
            fontSize: '32px',
          }}
        >
          {comment}
        </div>
      )}
      <div
        style={{
          width: '230px',
          zIndex: 90,
          position: 'absolute',
          bottom: 0,
          right: 0,
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 100,
            width: '120px',
            height: '180px',
            display: 'flex',
            top: '100px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ position: 'absolute', zIndex: 0, top: '0px' }}>
            <div>
              <div
                style={{
                  width: '104px',
                  height: '108px',
                  borderRadius: '200px',
                  border: '8px solid black',
                  boxShadow: '0px 10px 10px -6px rgba(5, 4, 4, 0.3)',
                  top: 0,
                  backgroundColor: '#E1ECC8',
                }}
              ></div>
            </div>
          </div>

          <div style={{ zIndex: 2, top: '64px', position: 'absolute' }}>
            <div style={{ width: '120px', height: '60px', position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  width: '104px',
                  height: '160px',
                  position: 'absolute',
                  borderBottomLeftRadius: '200px',
                  borderBottomRightRadius: '200px',
                  border: '8px solid rgba(0, 0, 0, 0)',
                  bottom: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* データがない時にもずんだもんは表示したままにする。 */}
                <img
                  src={
                    selectedCharacter === 'ずんだもん' || !selectedCharacter
                      ? chrome.runtime.getURL(
                          `images/zunndamonImg/${emotionType}/${emotionType}_${
                            isMouseOpen ? '開口' : '閉口'
                          }.png`
                        )
                      : getImageUrl()
                  }
                  style={{
                    borderBottomLeftRadius: '100px',
                    borderBottomRightRadius: '100px',
                    width: '160px',
                    position: 'absolute',
                    transition: 'top 0.2s ease-in-out',
                    top: isAnimation ? '-10px' : '0px',
                    zIndex: 1,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZundamonModel;
