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

      return res.status(200).json({
        success: true,
        message: `Face biometric embedding registered (${direction || 'front'})`,
        data: {
          face_id: registered.face_id,
          registered_on: registered.registered_on,
          last_updated: registered.last_updated
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
}

module.exports = new FaceController();
