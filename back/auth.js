import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


dotenv.config();
const prisma = new PrismaClient();

export const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Middleware to check JWT and role
export const authMiddleware = (roles) => (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET, async (err, decoded) => {
          if (err) {
            return res.sendStatus(403); // Invalid token
          }
  
          // Use Prisma to find the user by email
          const foundUser = await prisma.user.findUnique({
            where: { email: decoded.email },
          });
  
          if (!foundUser) {
            return res.sendStatus(404); // User not found
          }
          console.log("User found--------------", foundUser);
          req.user = foundUser;
          next();
        });
  
};