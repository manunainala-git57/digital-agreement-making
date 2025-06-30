import React, { useState, useContext } from 'react';
import {
  Container, Typography, TextField, Button, Stack, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import api from '../api/api.js';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateAgreement = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [inviteeEmails, setInviteeEmails] = useState('');
  const [signatureType, setSignatureType] = useState('typed');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ get current location

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      if (location.pathname !== '/login') {
        toast.error('User not authenticated. Please log in again.');
      }
      return;
    }

    const trimmedEmails = inviteeEmails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email && email !== user.email);

    if (trimmedEmails.length === 0) {
      toast.warning('Please provide at least one valid invitee email (not your own)');
      return;
    }

    let signatureValue = '';
    if (signatureType === 'typed') {
      if (!typedSignature.trim()) {
        toast.warning('Please type your signature');
        return;
      }
      signatureValue = typedSignature.trim();
    } else if (signatureType === 'image') {
      if (!uploadedImage) {
        toast.warning('Please upload an image of your signature');
        return;
      }
      signatureValue = uploadedImage;
    }

    try {
      await api.post('/agreements/create', {
        title,
        content,
        inviteeEmails: trimmedEmails,
        signature: {
          type: signatureType,
          value: signatureValue,
          email: user.email
        }
      });

      toast.success('Agreement created and signed successfully!');
      navigate('/my-agreements');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error creating agreement');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.warning('Only PNG or JPEG images are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        ✍️ Create and Sign Agreement
      </Typography>
      <form onSubmit={handleCreate}>
        <Stack spacing={3}>
          <TextField
            label="Agreement Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="Agreement Content"
            variant="outlined"
            multiline
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <TextField
            label="Invitee Emails (comma-separated)"
            variant="outlined"
            value={inviteeEmails}
            onChange={(e) => setInviteeEmails(e.target.value)}
            required
          />

          <Typography variant="subtitle1">Choose Signature Type:</Typography>
          <ToggleButtonGroup
            color="primary"
            value={signatureType}
            exclusive
            onChange={(e, newType) => newType && setSignatureType(newType)}
          >
            <ToggleButton value="typed">Typed</ToggleButton>
            <ToggleButton value="image">Upload</ToggleButton>
          </ToggleButtonGroup>

          {signatureType === 'typed' && (
            <TextField
              label="Typed Signature"
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              required
            />
          )}

          {signatureType === 'image' && (
            <>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageUpload}
              />
              {uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="Signature Preview"
                  style={{
                    maxHeight: '150px',
                    maxWidth: '400px',
                    border: '2px solid #ccc',
                    borderRadius: '6px',
                    objectFit: 'contain',
                    marginTop: '8px'
                  }}
                />
              )}
            </>
          )}

          <Button variant="contained" color="primary" type="submit">
            Sign & Create Agreement
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default CreateAgreement;


// import React, { useState, useContext, useRef } from 'react';
// import {
//   Container, Typography, TextField, Button, Stack, ToggleButtonGroup, ToggleButton
// } from '@mui/material';
// import api from '../api/api.js';
// import { AuthContext } from '../context/AuthContext';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';
// import SignatureCanvas from 'react-signature-canvas';


// const CreateAgreement = () => {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [inviteeEmails, setInviteeEmails] = useState('');
//   const [signatureType, setSignatureType] = useState('typed');
//   const [typedSignature, setTypedSignature] = useState('');
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const sigCanvasRef = useRef(null);
//   const [previewPdf, setPreviewPdf] = useState(null);
//   const [previewOpen, setPreviewOpen] = useState(false);

  

//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleCreate = async (e) => {
//     e.preventDefault();

//     if (!user?.email) {
//       toast.error('User not authenticated. Please log in again.');
//       return;
//     }

//     const trimmedEmails = inviteeEmails
//       .split(',')
//       .map((email) => email.trim())
//       .filter((email) => email && email !== user.email);

//     if (trimmedEmails.length === 0) {
//       toast.warning('Please provide at least one valid invitee email (not your own)');
//       return;
//     }

//     let signatureValue = '';

//     if (signatureType === 'typed') {
//       if (!typedSignature.trim()) {
//         toast.warning('Please type your signature');
//         return;
//       }
//       signatureValue = typedSignature.trim();
//     } else if (signatureType === 'drawn') {
//       if (sigCanvasRef.current.isEmpty()) {
//         toast.warning('Please draw your signature');
//         return;
//       }
//       signatureValue = sigCanvasRef.current
//         .getTrimmedCanvas()
//         .toDataURL('image/png', 1.0); // Higher export quality
//     } else if (signatureType === 'image') {
//       if (!uploadedImage) {
//         toast.warning('Please upload an image of your signature');
//         return;
//       }
//       signatureValue = uploadedImage;
//     }
//     try {
//       const response = await api.post('/agreements/create', {
//         title,
//         content,
//         inviteeEmails: trimmedEmails,
//         signature: {
//           type: signatureType,
//           value: signatureValue,
//           email: user.email
//         }
//       });
  
//       toast.success('Agreement created and signed successfully!');
  
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Error creating agreement');
//     }
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.size > 2 * 1024 * 1024) {
//       toast.warning('Please upload an image smaller than 2MB');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setUploadedImage(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <Container sx={{ mt: 8 }}>
//       <Typography variant="h5" gutterBottom>
//         ✍️ Create and Sign Agreement
//       </Typography>
//       <form onSubmit={handleCreate}>
//         <Stack spacing={3}>
//           <TextField
//             label="Agreement Title"
//             variant="outlined"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             required
//           />
//           <TextField
//             label="Agreement Content"
//             variant="outlined"
//             multiline
//             rows={6}
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             required
//           />
//           <TextField
//             label="Invitee Emails (comma-separated)"
//             variant="outlined"
//             value={inviteeEmails}
//             onChange={(e) => setInviteeEmails(e.target.value)}
//             required
//           />
//           <Typography variant="subtitle1">Choose Signature Type:</Typography>
//           <ToggleButtonGroup
//             color="primary"
//             value={signatureType}
//             exclusive
//             onChange={(e, newType) => newType && setSignatureType(newType)}
//           >
//             <ToggleButton value="typed">Typed</ToggleButton>
//             <ToggleButton value="drawn">Canvas</ToggleButton>
//             <ToggleButton value="image">Upload</ToggleButton>
//           </ToggleButtonGroup>

//           {signatureType === 'typed' && (
//             <>
//               <TextField
//                 label="Typed Signature"
//                 value={typedSignature}
//                 onChange={(e) => setTypedSignature(e.target.value)}
//                 required
//               />
//               {typedSignature && (
//                 <div style={{
//                   fontFamily: 'Pacifico, cursive',
//                   fontSize: '24px',
//                   marginTop: '10px',
//                   border: '1px dashed #ccc',
//                   padding: '8px',
//                   display: 'inline-block'
//                 }}>
//                   Preview: {typedSignature}
//                 </div>
//               )}
//             </>
//           )}

//           {signatureType === 'drawn' && (
//             <>
//               <SignatureCanvas
//                 ref={sigCanvasRef}
//                 penColor="black"
//                 canvasProps={{
//                   width: 500,
//                   height: 200,
//                   className: 'sigCanvas',
//                   style: {
//                     width: '500px',
//                     height: '200px',
//                     border: '2px solid #ccc',
//                     borderRadius: '8px',
//                     backgroundColor: '#fff',
//                     display: 'block'
//                   }
//                 }}
//               />
//               <Button
//                 variant="outlined"
//                 size="small"
//                 onClick={() => sigCanvasRef.current.clear()}
//               >
//                 Clear Signature
//               </Button>
//             </>
//           )}

//           {signatureType === 'image' && (
//             <>
//               <input
//                 type="file"
//                 accept="image/png, image/jpeg"
//                 onChange={handleImageUpload}
//               />
//               {uploadedImage && (
//                 <img
//                   src={uploadedImage}
//                   alt="Signature Preview"
//                   style={{
//                     maxHeight: '150px',
//                     maxWidth: '400px',
//                     border: '2px solid #ccc',
//                     borderRadius: '6px',
//                     objectFit: 'contain',
//                     marginTop: '8px'
//                   }}
//                 />
//               )}
//             </>
//           )}

         

//           <Button variant="contained" color="primary" type="submit">
//             Sign & Create Agreement
//           </Button>
//         </Stack>
//       </form>


//     </Container>
//   );
// };

// export default CreateAgreement;

 