import React, { useContext, useEffect, useRef, useState } from "react";
import AppContext from "../../utils/hooks/createContext";
import {
  Button,
  Card,
  Modal,
  Offcanvas,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Alert,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useColorContext } from "../../contexts/ColorContext";
import { IoIosCloudDownload, IoMdImage } from "react-icons/io";
import { FaShare, FaLongArrowAltRight, FaInfoCircle } from "react-icons/fa";
import { RxReset } from "react-icons/rx";
import { MdOutlineChangeCircle } from "react-icons/md";
import { Capacitor } from "@capacitor/core";
import axios from "axios";
import { Share } from "@capacitor/share";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faPlus, faUpload } from "@fortawesome/free-solid-svg-icons";
import texturedata from "../../utils/texturedata.json";
import Image from "next/image";
import {
  onnxMaskToImage,
  loadNpyTensor,
  loadNpyTensor1,
  convertURLtoFile,
  convertImageEleToData,
  imageDataToImage,
  scaleTexture,
  downloadImage,
  processTexture,
} from "../../utils/helpers/maskUtils";
import ImageMaskComponent from "./ImageSegmentation";

function VisualizeRoom({
  nextStep,
  prevStep,
  moveToStep,
  initialMasks,
  setMaskedImageWithColors,
  isPreloaded,
  saveSegmentedImageState,
  restoreSegmentedImageState,
  hasProcessedImage,
}: any) {
  
  // 🚀 NEW: State for undo functionality
  const [canUndo, setCanUndo] = useState(false);
  const [undoFunction, setUndoFunction] = useState<(() => void) | null>(null);
  const {
    image: [image],
    texture: [texture, setTexture],
    color: [color, setColor],
  } = useContext(AppContext)!;

  const { selectedColors } = useColorContext();
  const [selectedColor, setSelectedColor] = useState("");
  const [clearSignal, setClearSignal] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  // 🟢 SAFE ADDITIONS: New state for UI improvements
  const [isProcessingTexture, setIsProcessingTexture] = useState(false);
  const [isClearingMasks, setIsClearingMasks] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleCloseOffCanvas = () => setShowOffcanvas(false);
  const handleShowOffCanvas = () => setShowOffcanvas(true);

  // 🚨 CRITICAL FUNCTION - Enhanced with loading state only
  const handleClearMasks = () => {
    setIsClearingMasks(true); // 🟢 SAFE: Visual feedback
    setClearSignal(true); // 🚨 CRITICAL: Don't modify this
    setTimeout(() => {
      setClearSignal(false); // 🚨 CRITICAL: Don't modify this
      setIsClearingMasks(false); // 🟢 SAFE: Visual feedback
    }, 100);
  };

  // 🟢 SAFE: Enhanced tooltip with better styling
  const showTooltip = (msg: string) => (
    <Tooltip 
      id="button-tooltip" 
      className="custom-tooltip"
      style={{
        backgroundColor: '#333',
        color: 'white',
        fontSize: '0.875rem',
        padding: '8px 12px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      {msg}
    </Tooltip>
  );

  // 🚨 CRITICAL FUNCTION - Enhanced with loading state only
  const handleTextureClick = (texture: any) => {
    if (!image) return;
    
    setIsProcessingTexture(true); // 🟢 SAFE: Visual feedback
    
    try {
      const img = document.createElement("img");
      img.src = texture.url;
      img.onload = () => {
        scaleTexture(image, img).then((scaledTexture) => {
          if (!scaledTexture) {
            setIsProcessingTexture(false);
            return;
          }
          if (scaledTexture instanceof HTMLImageElement) {
            setTexture(scaledTexture); // 🚨 CRITICAL: Don't modify
            toast.success("Texture Selected Successfully!", {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            handleCloseOffCanvas();
          }
          setColor(null); // 🚨 CRITICAL: Don't modify
          setIsProcessingTexture(false); // 🟢 SAFE: Visual feedback
        });
      };
      
      img.onerror = () => {
        setIsProcessingTexture(false);
        toast.error("Failed to load texture. Please try again.");
      };
    } catch (error) {
      console.log(error);
      setIsProcessingTexture(false);
      toast.error("Error processing texture. Please try again.");
    }
  };

  // 🟢 SAFE: Helper function to get color name or fallback
  const getColorDisplayName = (color: any, index: number) => {
    return color.name || color.hex || `Color ${index + 1}`;
  };

  return (
    <>
      {/* 🟢 SAFE: Enhanced styling with custom CSS classes */}
      <div className="colorvisualiser__container container-fluid m-0 p-0 pt-5 md:pt-0">
        <div className="row m-0 p-0 align-items-start">
          {/* 🚨 CRITICAL: Left side - DO NOT MODIFY this structure */}
          <div className="col-12 col-lg-8 colorvisualiser__container__left d-flex justify-content-center mb-4 mb-lg-0">
            <ImageMaskComponent
              selectedColor={selectedColor}
              clearMasksSignal={clearSignal}
              setDownloadableImage={setMaskedImageWithColors}
              saveSegmentedImageState={saveSegmentedImageState}
              restoreSegmentedImageState={restoreSegmentedImageState}
              hasProcessedImage={hasProcessedImage}
              setCanUndo={setCanUndo}
              setUndoFunction={setUndoFunction}
            />
          </div>

          {/* 🟢 SAFE: Right side - Enhanced with better styling and UX */}
          <div className="col-12 col-lg-4 colorvisualiser__container__right">
            
            {/* 🟢 SAFE: Enhanced instructions section */}
            {showInstructions && (
              <div className="mb-3">
                <Alert 
                  variant="info" 
                  dismissible 
                  onClose={() => setShowInstructions(false)}
                  className="border-0 shadow-sm"
                  style={{
                    backgroundColor: '#e3f2fd',
                    borderLeft: '4px solid #2196f3',
                    fontSize: '0.875rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  <FaInfoCircle className="me-2" />
                  <strong>How to use:</strong> Select a color below, then click on the room image to paint that area.
                </Alert>
              </div>
            )}

            {/* 🟢 SAFE: NEW - Enhanced detailed instructions bar */}
            <div className="mb-4">
              <Card 
                className="border-0 shadow-sm"
                style={{
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  border: '1px solid #dee2e6',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    padding: '12px 20px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                  }}
                >
                  🎨 Painting Tips & Best Practices
                </div>
                <Card.Body 
                  className="p-3 p-md-4"
                  style={{ fontSize: '0.875rem' }}
                >
                  <div className="row g-2 g-md-3">
                    <div className="col-12 col-sm-6">
                      <div className="mb-2 mb-md-3">
                        <div 
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#28a745',
                            borderRadius: '50%',
                            marginRight: '10px',
                            marginBottom: '2px'
                          }}
                        ></div>
                        <span style={{ color: '#495057', fontWeight: '500', fontSize: '0.8rem' }}>Click on walls to paint</span>
                      </div>
                      <div className="mb-2 mb-md-3">
                        <div 
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#28a745',
                            borderRadius: '50%',
                            marginRight: '10px',
                            marginBottom: '2px'
                          }}
                        ></div>
                        <span style={{ color: '#495057', fontWeight: '500', fontSize: '0.8rem' }}>Drag to paint larger areas</span>
                      </div>
                    </div>
                    <div className="col-12 col-sm-6">
                      <div className="mb-2 mb-md-3">
                        <div 
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#dc3545',
                            borderRadius: '50%',
                            marginRight: '10px',
                            marginBottom: '2px'
                          }}
                        ></div>
                        <span style={{ color: '#495057', fontWeight: '500', fontSize: '0.8rem' }}>Avoid windows & doors</span>
                      </div>
                      <div className="mb-2 mb-md-3">
                        <div 
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#dc3545',
                            borderRadius: '50%',
                            marginRight: '10px',
                            marginBottom: '2px'
                          }}
                        ></div>
                        <span style={{ color: '#495057', fontWeight: '500', fontSize: '0.8rem' }}>
                          Don&#39;t paint furniture
                        </span>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="mt-3 p-2 p-md-3"
                    style={{ 
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      borderRadius: '12px',
                      border: '1px solid #90caf9',
                      position: 'relative'
                    }}
                  >
                    <div 
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '20px',
                        background: '#2196f3',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}
                    >
                      PRO TIP
                    </div>
                    <div className="mt-2" style={{ color: '#1565c0', fontSize: '0.8rem', lineHeight: '1.5' }}>
                      Use the Clear button to start over, and remember to paint walls completely for best results!
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            {/* 🟢 SAFE: Enhanced place order button */}
            <div className="colorvisualiser__tools_container mb-4">
              <button
                className="w-100 btn btn-primary position-relative overflow-hidden"
                type="button"
                onClick={nextStep}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 20px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textTransform: 'none',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }}
                aria-label="Proceed to book your painting service"
              >
                Book your service <FaLongArrowAltRight className="fs-3 ms-2" />
              </button>
            </div>

            {/* 🟢 SAFE: Enhanced tools section */}
            <div className="colorvisualiser__tools_container mb-4">
              <Card 
                className="border-0 shadow-sm"
                style={{
                  borderRadius: '16px',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e1e5e9',
                }}
              >
                <Card.Body className="d-flex justify-content-center gap-2 gap-md-3 align-items-center" style={{ padding: '15px 20px' }}>
                  {/* 🚀 NEW: Undo Last Action Button - FIRST IN ROW */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Undo last painting action")}
                  >
                    <Button
                      className="colorvisualiser__button"
                      onClick={() => {
                        // Call the actual undo function
                        if (undoFunction) {
                          undoFunction();
                        }
                      }}
                      disabled={!canUndo}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                        opacity: canUndo ? 1 : 0.5,
                      }}
                      onMouseOver={(e) => {
                        if (canUndo) {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.backgroundColor = '#F57C00';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.backgroundColor = '#FF9800';
                      }}
                      aria-label="Undo last painting action"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8px"/>
                      </svg>
                    </Button>
                  </OverlayTrigger>

                  {/* 🟢 SAFE: Enhanced Clear Masks Button */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Clear all painted colors")}
                  >
                    <Button
                      className="colorvisualiser__button"
                      onClick={handleClearMasks} // 🚨 CRITICAL: Don't modify this
                      disabled={isClearingMasks}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                      }}
                      onMouseOver={(e) => {
                        if (!isClearingMasks) {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.backgroundColor = '#ff5252';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.backgroundColor = '#ff6b6b';
                      }}
                      aria-label="Clear all painted colors from the image"
                    >
                      {isClearingMasks ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <RxReset size={20} />
                      )}
                    </Button>
                  </OverlayTrigger>

                  {/* 🟢 SAFE: Enhanced Change Image Button */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Upload a different room image")}
                  >
                    <Button
                      className="colorvisualiser__button"
                      onClick={() => {
                        moveToStep(0); // 🚨 CRITICAL: Don't modify this
                        toast.success("You can now select a new image", {
                          position: "top-right",
                          autoClose: 2000,
                        });
                      }}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.backgroundColor = '#43a047';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.backgroundColor = '#4caf50';
                      }}
                      aria-label="Change to a different room image"
                    >
                      <MdOutlineChangeCircle size={20} />
                    </Button>
                  </OverlayTrigger>
                </Card.Body>
              </Card>
            </div>

            {/* 🟢 SAFE: Enhanced paint selection section */}
            <div className="colorvisualiser__color_container mb-4">
              <Card 
                className="border-0 shadow-sm"
                style={{
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e1e5e9',
                }}
              >
                <Card.Title 
                  className="text-center fw-bold mt-3 mb-2"
                  style={{
                    fontSize: '1.25rem',
                    color: '#2d3748',
                    letterSpacing: '0.5px'
                  }}
                >
                  Select Your Paint Colors
                  <div 
                    style={{
                      width: '60px',
                      height: '3px',
                      backgroundColor: '#667eea',
                      margin: '8px auto 0',
                      borderRadius: '2px'
                    }}
                  ></div>
                </Card.Title>
                
                <Card.Body 
                  className="d-flex flex-wrap gap-2 gap-md-3 justify-content-center align-items-center"
                  style={{ padding: '15px 10px 20px' }}
                >
                  {selectedColors.map((color: any, index: number) => {
                    const isSelected = color.hex === selectedColor; // 🚨 CRITICAL: Don't modify this logic
                    const colorName = getColorDisplayName(color, index);
                    
                    return (
                      <OverlayTrigger
                        key={index}
                        placement="top"
                        overlay={showTooltip(colorName)}
                      >
                        <Button
                          className={`colorvisualiser__color_button ${isSelected ? "selected" : ""}`}
                          style={{
                            backgroundColor: color.hex,
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            border: isSelected ? '3px solid #333' : '3px solid transparent',
                            boxShadow: isSelected 
                              ? '0 0 20px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)' 
                              : '0 4px 12px rgba(0,0,0,0.15)',
                            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '0',
                          }}
                          onClick={() => {
                            setSelectedColor(color.hex); // 🚨 CRITICAL: Don't modify this
                            toast.success(`${colorName} selected!`, {
                              position: "top-right",
                              autoClose: 1500,
                            });
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }
                          }}
                          aria-label={`Select ${colorName} for painting`}
                          role="radio"
                          aria-checked={isSelected}
                        >
                          {/* 🟢 SAFE: Screen reader text */}
                          <span className="sr-only">{colorName}</span>
                          
                          {/* 🟢 SAFE: Selection indicator */}
                          {isSelected && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '20px',
                                height: '20px',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <div
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  backgroundColor: '#333',
                                  borderRadius: '50%',
                                }}
                              ></div>
                            </div>
                          )}
                        </Button>
                      </OverlayTrigger>
                    );
                  })}

                  {/* 🟢 SAFE: Enhanced Add Color Button */}
                  <OverlayTrigger
                    placement="top"
                    overlay={showTooltip("Add more colors to your palette")}
                  >
                    <Button
                      className="colorvisualiser__color_addbutton"
                      onClick={prevStep} // 🚨 CRITICAL: Don't modify this
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        border: '3px dashed #ccc',
                        backgroundColor: 'transparent',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.color = '#667eea';
                        e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#ccc';
                        e.currentTarget.style.color = '#666';
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      aria-label="Add more colors to your palette"
                    >
                      <FontAwesomeIcon icon={faPlus} size="lg" />
                    </Button>
                  </OverlayTrigger>
                </Card.Body>

                {/* 🟢 SAFE: Status message */}
                {selectedColor && (
                  <div 
                    className="px-3 pb-3"
                    style={{
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      color: '#666',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      margin: '0 15px 15px',
                      padding: '10px',
                      borderRadius: '8px',
                    }}
                  >
                    🎨 <strong>Active:</strong> {getColorDisplayName(
                      selectedColors.find(c => c.hex === selectedColor) || { hex: selectedColor }, 
                      0
                    )}
                    <br />
                    <small>Click on the room image to paint with this color</small>
                  </div>
                )}
              </Card>
            </div>

            {/* 🟢 SAFE: Enhanced help section */}
            <div className="text-center">
              <Card 
                className="border-0 shadow-sm"
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center justify-content-center">
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#667eea',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}
                    >
                      <span style={{ color: 'white', fontSize: '16px' }}>🎨</span>
                    </div>
                    <div className="text-start">
                      <div className="fw-bold mb-1" style={{ color: '#495057', fontSize: '0.9rem' }}>
                        Quick Painting Guide
                      </div>
                      <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                        <div>• <strong>Click:</strong> Paint small areas</div>
                        <div>• <strong>Drag:</strong> Paint larger wall sections</div>
                        <div>• <strong>Focus:</strong> Paint walls completely for best results</div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 🚨 CRITICAL: Offcanvas - Enhanced styling only */}
      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffCanvas}
        placement="end"
        style={{
          borderRadius: '20px 0 0 20px',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
        }}
      >
        <Offcanvas.Header 
          closeButton
          style={{
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e9ecef',
            padding: '20px'
          }}
        >
          <Offcanvas.Title
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2d3748'
            }}
          >
            Select Textures
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: '20px' }}>
          {isProcessingTexture && (
            <div className="text-center mb-3">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">Processing texture...</div>
            </div>
          )}
          
          <Card 
            className="border-0 shadow-sm"
            style={{
              borderRadius: '12px',
              backgroundColor: '#fafafa'
            }}
          >
            <Card.Body className="d-flex flex-wrap gap-3 justify-content-center align-items-center">
              {texturedata.map((texture: any, index: number) => (
                <Button
                  className="p-0 border-0 colorvisualiser__texture_button"
                  key={index}
                  onClick={() => handleTextureClick(texture)} // 🚨 CRITICAL: Don't modify this
                  disabled={isProcessingTexture}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  onMouseOver={(e) => {
                    if (!isProcessingTexture) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  aria-label={`Select texture ${index + 1}`}
                >
                  <Image
                    src={texture.url}
                    alt={`Texture option ${index + 1}`}
                    width={90}
                    height={90}
                    style={{ borderRadius: '8px' }}
                  />
                </Button>
              ))}
            </Card.Body>
          </Card>
        </Offcanvas.Body>
      </Offcanvas>

      {/* 🟢 SAFE: Custom CSS for enhanced styling */}
      <style jsx>{`
        .custom-tooltip {
          font-size: 0.875rem !important;
        }
        
        .colorvisualiser__color_button:focus {
          outline: 3px solid #667eea !important;
          outline-offset: 2px !important;
        }
        
        .colorvisualiser__color_button.selected {
          animation: pulse-selection 0.6s ease-out;
        }
        
        @keyframes pulse-selection {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1.15); }
        }
        
        .btn:focus {
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25) !important;
        }
        
        /* 🟢 SAFE: Enhanced Mobile Responsiveness */
        @media (max-width: 768px) {
          .colorvisualiser__color_button {
            width: 40px !important;
            height: 40px !important;
          }
          
          .colorvisualiser__container__left {
            margin-bottom: 1rem !important;
          }
          
          .colorvisualiser__container__right {
            padding: 0 10px !important;
          }
          
          .colorvisualiser__tools_container .card-body {
            padding: 12px 15px !important;
          }
          
          .colorvisualiser__color_container .card-body {
            padding: 12px 8px 18px !important;
          }
          
          .colorvisualiser__color_container .card-title {
            font-size: 1.1rem !important;
            margin-top: 1rem !important;
          }
          
          .btn {
            font-size: 0.9rem !important;
            padding: 12px 16px !important;
          }
          
          .alert {
            font-size: 0.8rem !important;
            padding: 0.75rem !important;
          }
          
          .card-body {
            padding: 1rem !important;
          }
          
          .offcanvas {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .offcanvas-body {
            padding: 15px !important;
          }
        }
        
        @media (max-width: 576px) {
          .colorvisualiser__container {
            padding: 0 5px !important;
          }
          
          .colorvisualiser__color_button {
            width: 35px !important;
            height: 35px !important;
          }
          
          .colorvisualiser__tools_container .btn {
            width: 45px !important;
            height: 45px !important;
          }
          
          .colorvisualiser__tools_container .btn svg {
            width: 18px !important;
            height: 18px !important;
          }
          
          .row.g-2.g-md-3 {
            gap: 0.5rem !important;
          }
          
          .card {
            margin-bottom: 1rem !important;
          }
          
          .btn-primary {
            font-size: 0.85rem !important;
            padding: 10px 14px !important;
          }
        }
        
        @media (max-width: 480px) {
          .colorvisualiser__container__right {
            padding: 0 5px !important;
          }
          
          .colorvisualiser__color_button {
            width: 32px !important;
            height: 32px !important;
          }
          
          .colorvisualiser__tools_container .btn {
            width: 40px !important;
            height: 40px !important;
          }
          
          .colorvisualiser__tools_container .btn svg {
            width: 16px !important;
            height: 16px !important;
          }
          
          .card-body {
            padding: 0.75rem !important;
          }
          
          .btn-primary {
            font-size: 0.8rem !important;
            padding: 8px 12px !important;
          }
        }
        
        /* 🟢 SAFE: Touch Device Optimizations */
        @media (hover: none) and (pointer: coarse) {
          .colorvisualiser__color_button:hover {
            transform: none !important;
          }
          
          .btn:hover {
            transform: none !important;
          }
          
          .colorvisualiser__color_button:active {
            transform: scale(0.95) !important;
          }
          
          .btn:active {
            transform: scale(0.95) !important;
          }
        }
        
        /* 🟢 SAFE: Landscape Mobile Optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          .colorvisualiser__container__left {
            margin-bottom: 0.5rem !important;
          }
          
          .colorvisualiser__container__right {
            padding: 0 15px !important;
          }
        }
      `}</style>
    </>
  );
}

export default VisualizeRoom;