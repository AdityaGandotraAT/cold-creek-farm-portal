import { previewVendorReply, respondToVendorReply } from '../services/bookingService.js';

export async function getVendorReplyPreview(req, res, next) {
  try {
    const preview = await previewVendorReply(req.query.token);
    res.status(200).json({ status: 'ok', ...preview });
  } catch (err) {
    next(err);
  }
}

export async function postVendorReply(req, res, next) {
  try {
    const result = await respondToVendorReply(req.body?.token, req.body?.decision);
    res.status(200).json({
      status: 'ok',
      message: result.alreadyResponded
        ? 'This vendor already replied'
        : result.status === 'Confirmed'
          ? 'Availability accepted'
          : 'Marked not available',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}
