import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ImagePlus, Mic } from 'lucide-react';
import Header from '../components/common/Header/Header';
import { useThemeColors } from '../hooks/useThemeColors';

const ConsumerLandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-expanding textarea
  const textareaRef = useRef(null);
  const [textareaHeight, setTextareaHeight] = useState('24px');

  // Image upload (multiple images support)
  const [uploadedImages, setUploadedImages] = useState([]);
  const imageInputRef = useRef(null);

  // Voice input
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Temporarily reset height to get accurate scrollHeight measurement
    const previousHeight = textarea.style.height;
    textarea.style.height = 'auto';

    const lineHeight = 24; // 1.5 × 16px = 24px
    const minHeight = lineHeight; // 1 line = 24px
    const maxHeight = lineHeight * 3; // 3 lines = 72px

    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    // Restore height (will be overridden by React re-render with new state)
    textarea.style.height = previousHeight;

    setTextareaHeight(`${newHeight}px`);
  }, [searchQuery]);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please enable it in your browser settings.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const MAX_IMAGES = 5;
    const acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Check if already at max capacity
    if (uploadedImages.length >= MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      return;
    }

    // Calculate how many more images we can add
    const remainingSlots = MAX_IMAGES - uploadedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    // Warn if trying to upload more than remaining slots
    if (files.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} (maximum ${MAX_IMAGES} total)`);
    }

    // Validate and process each file
    filesToProcess.forEach(file => {
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        alert(`${file.name}: Please upload a JPEG, PNG, or WEBP image`);
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        alert(`${file.name}: Image size must be less than 5MB`);
        return;
      }

      // Read as base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => {
          // Double-check we haven't exceeded the limit
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, {
            file: file,
            preview: e.target.result,
            id: Date.now() + Math.random() // Unique ID for each image
          }];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be uploaded again if removed
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || uploadedImages.length > 0) {
      navigate('/curate-my-fit', {
        state: {
          searchQuery: searchQuery.trim(),
          images: uploadedImages.map(img => img.preview) // Pass array of base64 images
        }
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#fff9f5',
      backgroundImage: `
        radial-gradient(circle at 50% 50%, #ffecd9 0%, rgba(255, 236, 217, 0) 65%),
        radial-gradient(circle at 0% 50%, #ffb6e6 0%, transparent 60%),
        radial-gradient(circle at 100% 0%, #9dcaff 0%, transparent 60%)
      `,
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Readex Pro", sans-serif',
      color: '#2D3748',
    }}>
      <Header variant="landing" showNav={true} />

      {/* Main Content */}
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        padding: `${uploadedImages.length > 0 ? '140px' : '220px'} 20px 40px`,
        textAlign: 'center',
        transition: 'padding 0.3s ease',
        position: 'relative',
        zIndex: 10,
      }}>
        
        {/* Hero Header Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
          width: '100%',
          maxWidth: '1000px',
          marginBottom: '25px',
          textAlign: 'left',
        }}>
          {/* Mascot (Bigger) */}
          <div style={{
            width: '200px',
            height: '240px',
            flexShrink: 0,
            animation: 'float 6s ease-in-out infinite',
          }}>
             <img 
              src="/egg-chan.svg" 
              alt="Aura-chan" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Text Content */}
          <div>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#2D3748',
              margin: '0 0 16px 0',
              lineHeight: '1.1',
            }}>
              Hi, I'm Aura-chan!<br/>
              <span style={{ color: '#793DB0' }}>Your personal shopping assistant...</span>
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: '#4A5568',
              maxWidth: '560px',
              margin: 0,
              lineHeight: '1.6',
            }}>
              Tell me about an event, outfit or idea you want to shop for, and I can come back with curated suggestions just for you!
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            width: '100%',
            maxWidth: '1000px',
            marginBottom: '60px',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10,
          }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.8)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.4)';
          }}
        >
          {/* Hidden file input */}
          <input
            type="file"
            ref={imageInputRef}
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />

          {/* Text Input Area */}
          <div style={{
            padding: '12px 16px',
          }}>
            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '12px',
              }}>
                {uploadedImages.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid rgba(121, 61, 176, 0.2)',
                    }}
                  >
                    <img
                      src={image.preview}
                      alt="Upload preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Textarea */}
            <div style={{
              height: textareaHeight,
              transition: 'height 0.15s ease',
            }}>
              <textarea
                ref={textareaRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
                placeholder="What are you looking for?"
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '0',
                  fontSize: '16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  color: '#2D3748',
                  resize: 'none',
                  lineHeight: '1.5',
                  fontFamily: 'inherit',
                  overflowY: 'auto'
                }}
              />
            </div>
          </div>

          {/* Button Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px 12px 16px',
            borderTop: '1px solid rgba(121, 61, 176, 0.1)',
          }}>
            {/* Image Upload Button (Image Icon) */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadedImages.length >= 5}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px dashed rgba(121, 61, 176, 0.4)',
                backgroundColor: 'transparent',
                color: uploadedImages.length >= 5 ? '#a0aec0' : '#793DB0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadedImages.length >= 5 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: uploadedImages.length >= 5 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (uploadedImages.length < 5) {
                  e.currentTarget.style.backgroundColor = 'rgba(121, 61, 176, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (uploadedImages.length < 5) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <ImagePlus size={20} strokeWidth={2.5} />
            </button>

            {/* Voice Input Button (Microphone) - HIDDEN FOR NOW */}
            {false && (
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={!speechSupported}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isListening
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(121, 61, 176, 0.1)',
                  color: isListening ? '#ef4444' : '#793DB0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: speechSupported ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: speechSupported ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (speechSupported && !isListening) {
                    e.currentTarget.style.backgroundColor = 'rgba(121, 61, 176, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isListening) {
                    e.currentTarget.style.backgroundColor = 'rgba(121, 61, 176, 0.1)';
                  }
                }}
              >
                <Mic
                  size={20}
                  strokeWidth={2.5}
                  style={{
                    animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none'
                  }}
                />
              </button>
            )}

            {/* Submit Button (Arrow) */}
            <button
              type="submit"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #793DB0 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(118, 75, 162, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(118, 75, 162, 0.3)';
              }}
            >
              <ArrowRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Floating Bags (Decorative Row) */}
        
        {/* Left Group */}
        <div style={{ position: 'absolute', bottom: '12%', left: '5%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
           <img src="/shopping_bags1.png" alt="Shopping Bags" style={{ width: '130px', transform: 'rotate(-5deg)', animation: 'float 6s ease-in-out infinite' }} />
           <div style={{ width: '90px', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(7px)', marginTop: '12px', animation: 'shadow 6s ease-in-out infinite' }} />
        </div>
        
        {/* Center-Left Group (Bunched) */}
        <div style={{ position: 'absolute', bottom: '10%', left: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
           <img src="/shopping_bags2.png" alt="Shopping Bags" style={{ width: '210px', transform: 'rotate(2deg)', animation: 'float 7.5s ease-in-out infinite 0.2s' }} />
           <div style={{ width: '130px', height: '20px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(10px)', marginTop: '18px', animation: 'shadow 7.5s ease-in-out infinite 0.2s' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', left: '28%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
           <img src="/shopping_bags3.png" alt="Shopping Bags" style={{ width: '150px', transform: 'rotate(-3deg)', animation: 'float 6.5s ease-in-out infinite 1s' }} />
           <div style={{ width: '100px', height: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(8px)', marginTop: '15px', animation: 'shadow 6.5s ease-in-out infinite 1s' }} />
        </div>

        {/* Center Cluster (Main Bunch) */}
        <div style={{ position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 0 }}>
           <div style={{ position: 'absolute', bottom: '10px', left: '-70px', animation: 'float 8s ease-in-out infinite' }}>
             <img src="/shopping_bags2.png" alt="Shopping Bags" style={{ width: '170px', transform: 'rotate(-10deg)' }} />
             <div style={{ width: '110px', height: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(8px)', margin: '15px auto 0', animation: 'shadow 8s ease-in-out infinite' }} />
           </div>
           <div style={{ position: 'absolute', bottom: '30px', right: '-60px', animation: 'float 7s ease-in-out infinite 0.5s' }}>
             <img src="/shopping_bags1.png" alt="Shopping Bags" style={{ width: '150px', transform: 'rotate(15deg)' }} />
             <div style={{ width: '100px', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(7px)', margin: '12px auto 0', animation: 'shadow 7s ease-in-out infinite 0.5s' }} />
           </div>
           <div style={{ position: 'relative', animation: 'float 6s ease-in-out infinite 1s' }}>
             <img src="/shopping_bags3.png" alt="Shopping Bags" style={{ width: '160px', transform: 'rotate(5deg)' }} />
             <div style={{ width: '100px', height: '15px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(8px)', margin: '14px auto 0', animation: 'shadow 6s ease-in-out infinite 1s' }} />
           </div>
        </div>

        {/* Center-Right Group */}
        <div style={{ position: 'absolute', bottom: '11%', right: '35%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
           <img src="/shopping_bags1.png" alt="Shopping Bags" style={{ width: '170px', transform: 'rotate(4deg)', animation: 'float 7s ease-in-out infinite 0.5s' }} />
           <div style={{ width: '110px', height: '18px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(9px)', marginTop: '15px', animation: 'shadow 7s ease-in-out infinite 0.5s' }} />
        </div>

        {/* Right Group (Bunched) */}
        <div style={{ position: 'absolute', bottom: '12%', right: '15%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
           <img src="/shopping_bags2.png" alt="Shopping Bags" style={{ width: '180px', transform: 'rotate(-6deg)', animation: 'float 8s ease-in-out infinite 1.5s' }} />
           <div style={{ width: '120px', height: '18px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(9px)', marginTop: '18px', animation: 'shadow 8s ease-in-out infinite 1.5s' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '11%', right: '8%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
           <img src="/shopping_bags3.png" alt="Shopping Bags" style={{ width: '140px', transform: 'rotate(3deg)', animation: 'float 6s ease-in-out infinite 2s' }} />
           <div style={{ width: '90px', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(7px)', marginTop: '15px', animation: 'shadow 6s ease-in-out infinite 2s' }} />
        </div>

      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-20px) rotate(var(--r, 0deg)); }
        }
        @keyframes shadow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.8); opacity: 0.5; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ConsumerLandingPage;
