import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: { status?: number; message: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { status = 500, message } = error;

  res.status(status).json({ message });
};

export default errorHandler;