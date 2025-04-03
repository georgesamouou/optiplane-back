import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, generateToken, hashPassword } from './auth.js';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

// User Registration
app.post('/register', async (req, res) => {
  const { username, password, role,email,direction } = req.body;
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword, role,email,direction },
  });
  res.json(user);
});
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
// User Login
app.post('/login', async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Use Prisma to find the user by email
    const foundUser = await prisma.user.findUnique({
      where: { email: email },
    });

    //console.log("User found", foundUser);
    if (!foundUser) {
      return res.sendStatus(401); // Unauthorized
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      console.log("Match found");
      const accessToken = jwt.sign({ email: foundUser.email }, process.env.NEXT_PUBLIC_JWT_SECRET, {
        expiresIn: process.env.NEXT_PUBLIC_JWT_EXPIRATION,
      });
      console.log("accessToken",accessToken)
      const refreshToken = jwt.sign({ email: foundUser.email }, process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: '30d',
      });
      console.log("refreshToken",refreshToken)
      // Saving refreshToken with current user
      const currentUser = { ...foundUser, refreshToken, accessToken };
      console.log("User with TOKEN", currentUser);
      res.status(200).send(currentUser);
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error login' });
  }
});

app.get('/auth-me', async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    console.log("handle auth");
    console.log(authToken);
    if (authToken) {
      jwt.verify(authToken, process.env.NEXT_PUBLIC_JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.sendStatus(403); // Invalid token
        }

        console.log("token found");
        console.log(decoded);

        // Use Prisma to find the user by email
        const foundUser = await prisma.user.findUnique({
          where: { email: decoded.email },
        });

        if (!foundUser) {
          return res.sendStatus(404); // User not found
        }

        console.log(foundUser);
        res.status(200).send(foundUser);
      });
    } else {
      console.log("no token found");
      res.sendStatus(403); // No token provided
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/calendar', authMiddleware(['PMO_DIRECTION', 'EQUIPE_TTM', 'CHEF_DE_PROJET']), async (req, res) => {
  try {
    let projects;

    // Handle logic based on user role
    if (req.user.role === 'PMO_DIRECTION') {
      projects = await prisma.project.findMany({
        where: { direction: req.user.direction },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else if (req.user.role === 'EQUIPE_TTM') {
      projects = await prisma.project.findMany({
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else if (req.user.role === 'CHEF_DE_PROJET') {
      projects = await prisma.project.findMany({
        where: { createdById: req.user.id },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    // Format projects
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      url: '',
      title: project.title,
      start: project.startDate,
      end: project.endDate,
      allDay: true,
      extendedProps: { ...project },
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/projects', authMiddleware(['PMO_DIRECTION', 'EQUIPE_TTM', 'CHEF_DE_PROJET']), async (req, res) => {
  try {
    let projects;

    // Handle logic based on user role
    if (req.user.role === 'PMO_DIRECTION') {
      projects = await prisma.project.findMany({
        where: { direction: req.user.direction },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else if (req.user.role === 'EQUIPE_TTM') {
      projects = await prisma.project.findMany({
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else if (req.user.role === 'CHEF_DE_PROJET') {
      projects = await prisma.project.findMany({
        where: { createdById: req.user.id },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.put("/project/update", async (req, res) => {
  try {
    const { id, data } = req.body;
    console.log("ID", id);
    console.log("update data", req.body);

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        title: req.body.title,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        state: req.body.state,

      },
    });
    console.log("updatedProject", updatedProject);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Project Creation (Chef de Projet)
app.post('/project', authMiddleware(['CHEF_DE_PROJET']), async (req, res) => {
  const project = await prisma.project.create({
    data: {
      ...req.body,
      createdById: parseInt(req.body.createdById),
      state: 'INITIATION', // Auto-update state after creation
    },
  });
  res.json(project);
}); 

app.get('/project/valide', authMiddleware(['CHEF_DE_PROJET', 'EQUIPE_TTM', 'PMO_DIRECTION']), async (req, res) => {
  try {
    let projects;

    // Handle logic based on user role
    if (req.user.role === 'CHEF_DE_PROJET') {
      projects = await prisma.project.findMany({
        where: { state: 'SCHEDULED', createdById: req.user.id },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else if (req.user.role === 'EQUIPE_TTM') {
      projects = await prisma.project.findMany({
        where: { state: 'SCHEDULED' },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else if (req.user.role === 'PMO_DIRECTION') {
      projects = await prisma.project.findMany({
        where: { state: 'SCHEDULED', direction: req.user.direction },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch valid projects' });
  }
});
app.get('/project/invalide', authMiddleware(['CHEF_DE_PROJET', 'EQUIPE_TTM', 'PMO_DIRECTION']), async (req, res) => {
  try {
    let projects;

    // Handle logic based on user role
    if (req.user.role === 'CHEF_DE_PROJET') {
      projects = await prisma.project.findMany({
        where: {
          createdById: req.user.id,
          state: { not: 'SCHEDULED' },
        },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else if (req.user.role === 'EQUIPE_TTM') {
      projects = await prisma.project.findMany({
        where: {
          state: { not: 'SCHEDULED' },
        },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else if (req.user.role === 'PMO_DIRECTION') {
      projects = await prisma.project.findMany({
        where: {
          direction: req.user.direction,
          state: { not: 'SCHEDULED' },
        },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
        },
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch invalid projects' });
  }
});





// Update Project State (PMO Direction)
app.put('/projects/:id/state', authMiddleware(['PMO_DIRECTION']), async (req, res) => {
  const project = await prisma.project.update({
    where: { id: parseInt(req.params.id) },
    data: { state: 'TTM_VALIDATION' },
  });
  res.json(project);
});

// Set Project Date (Equipe TTM)
app.put('/projects/:id/date', authMiddleware(['EQUIPE_TTM']), async (req, res) => {
  const { date_souhaite } = req.body;
  const project = await prisma.project.update({
    where: { id: parseInt(req.params.id) },
    data: { date_souhaite: new Date(date_souhaite), state: 'SCHEDULED' },
  });
  res.json(project);
});

// Create Session and Assign Projects
app.post('/sessions', authMiddleware(['EQUIPE_TTM']), async (req, res) => {
  const session = await prisma.session.create({
    data: {
      ...req.body,
      date: new Date(req.body.date),
    },
  });
  res.json(session);
});
app.delete('/project/:id', authMiddleware(['CHEF_DE_PROJET', 'EQUIPE_TTM', 'PMO_DIRECTION']), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Role-based deletion logic
    if (req.user.role === 'CHEF_DE_PROJET' && project.state !== 'INITIATION') {
      return res.status(400).json({ error: 'Project cannot be deleted in this state' });
    }

    if (req.user.role === 'PMO_DIRECTION' && ['TTM_VALIDATION', 'SCHEDULED'].includes(project.state)) {
      return res.status(400).json({ error: 'Project cannot be deleted in this state' });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.listen(5001, () => console.log('Server running on port 5001'));