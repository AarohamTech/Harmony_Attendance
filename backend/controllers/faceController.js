const faceService = require('../services/faceService');

class FaceController {
  async registerFace(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const { base64Image, embedding, direction, face_image } = req.body;

      const faceData = embedding || base64Image || face_image;
      if (!faceData) {
        return res.status(400).json({
          success: false,
          message: 'Face image or embedding payload is required.'
        });
      }

      const payload = typeof faceData === 'string' ? faceData : JSON.stringify(faceData);
      const registered = await faceService.registerFace(employeeId, payload);
      let profilePhoto = null;
      if (typeof faceData === 'string') {
        if (faceData.startsWith('data:image/')) {
          profilePhoto = faceData;
        } else if (faceData.length > 100 && !faceData.startsWith('[')) {
          profilePhoto = `data:image/jpeg;base64,${faceData}`;
        }
      }

      if (profilePhoto) {
        await faceService.updateEmployeeProfilePhoto(employeeId, profilePhoto);
      }

      return res.status(200).json({
        success: true,
        message: `Face biometric embedding registered (${direction || 'front'})`,
        data: {
          face_id: registered.face_id,
          registered_on: registered.registered_on,
          last_updated: registered.last_updated,
          profile_photo: profilePhoto
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getFace(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const face = await faceService.getFace(employeeId);

      if (!face) {
        return res.status(404).json({
          success: false,
          message: 'No face biometric record found for this employee.'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          face_id: face.face_id,
          registered_on: face.registered_on,
          last_updated: face.last_updated
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyFace(req, res, next) {
    try {
      const employeeId = req.user.employee_id;
      const { embedding, base64Image, face_image } = req.body;

      const liveFace = embedding || base64Image || face_image;
      const result = await faceService.verifyFace(employeeId, liveFace);

      if (!result.verified || !result.matched) {
        return res.status(400).json({
          success: false,
          matched: false,
          message: result.message || 'Face verification failed. Live face does not match registered employee.'
        });
      }

      return res.status(200).json({
        success: true,
        matched: true,
        similarity: result.similarity,
        confidence: result.confidence,
        message: 'Face verified successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FaceController();
