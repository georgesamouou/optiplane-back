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

    console.log("Fetching calendar projects");

    // Handle logic based on user role
    if (req.user.role === 'PMO_DIRECTION') {
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { direction: req.user.direction }, // Projects in the user's direction
            {
              guests: {
                some: { id: req.user.id }, // Projects where the user is a guest
              },
            },
          ],
        },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
          guests: true, // Include guests in the response
        },
      });
    } else if (req.user.role === 'EQUIPE_TTM') {
      projects = await prisma.project.findMany({
        
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
          guests: true, // Include guests in the response
        },
      });
    } else if (req.user.role === 'CHEF_DE_PROJET') {
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { createdById: req.user.id }, // Projects created by the user
            {
              guests: {
                some: { id: req.user.id }, // Projects where the user is a guest
              },
            },
          ],
        },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
          guests: true, // Include guests in the response
        },
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    // Format projects for the calendar
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      url: '',
      title: project.title,
      start: project.startDate,
      end: project.endDate,
      allDay: false,
      guests: project.guests, // Include guests in the response
      extendedProps: { ...project },
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch calendar projects' });
  }
});

app.get('/projects', authMiddleware(['PMO_DIRECTION', 'EQUIPE_TTM', 'CHEF_DE_PROJET']), async (req, res) => {
  try {
    let projects;

    console.log("Fetching projects");

    // Handle logic based on user role
    if (req.user.role === 'PMO_DIRECTION') {
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { direction: req.user.direction }, // Projects in the user's direction
            {
              guests: {
                some: { id: req.user.id }, // Projects where the user is a guest
              },
            },
          ],
        },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
          guests: true, // Include guests in the response
        },
      });
    } else if (req.user.role === 'EQUIPE_TTM') {
      projects = await prisma.project.findMany({
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
          guests: true, // Include guests in the response
        },
      });
    } else if (req.user.role === 'CHEF_DE_PROJET') {
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { createdById: req.user.id }, // Projects created by the user
            {
              guests: {
                some: { id: req.user.id }, // Projects where the user is a guest
              },
            },
          ],
        },
        include: {
          createdBy: { select: { id: true, username: true } },
          session: true,
          guests: true, // Include guests in the response
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

app.put("/project/update",  async (req, res) => {
  try {
    const { id, guests, ...data } = req.body; // Destructure `id`, `guests`, and other fields

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Fetch the current project details
    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: { guests: true }, // Include current guests for comparison
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the project is associated with a session and if the date is being updated
    if (existingProject.sessionId && data.startDate) {
      const currentProjectDate = new Date(existingProject.startDate).getDate(); // Extract day
      const updatedProjectDate = new Date(data.startDate).getDate(); // Extract day

      // If the updated date is different from the current date, remove the project from the session
      if (currentProjectDate !== updatedProjectDate) {
        console.log("Removing project from session due to date change");
        await prisma.project.update({
          where: { id: parseInt(id) },
          data: { sessionId: null },
        });
      }
    }

    // Handle guests update
    if (guests) {
      // Disconnect all existing guests and connect the new ones
      await prisma.project.update({
        where: { id: parseInt(id) },
        data: {
          guests: {
            set: guests.map((guestId) => ({ id: parseInt(guestId) })), // Replace guests
          },
        },
      });
    }

    // Exclude invalid fields from the update data
    const { createdBy, session, createdAt, ...validData } = data;

    // Update the project with the valid data
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: validData, // Pass only valid fields
      include: { guests: true }, // Include updated guests in the response
    });
    console.log("Updated project", updatedProject);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update project" });
  }
});


app.post('/project', authMiddleware(['CHEF_DE_PROJET']), async (req, res) => {
  const { guests, ...rest } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        ...rest,
        createdById: parseInt(req.body.createdById),
        state: 'INITIATION', // Auto-update state after creation
        guests: {
          connect: guests?.map((guestId) => ({ id: parseInt(guestId) })), // Connect guests if provided
        },
      },
    });
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
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

// Create a Session
app.post('/sessions', authMiddleware(['EQUIPE_TTM']), async (req, res) => {
  try {
  
    const session = await prisma.session.create({
      data: {
        ...req.body,
        date: new Date(req.body.date),
      },
    });
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update a Session
app.put('/sessions/:id', authMiddleware(['EQUIPE_TTM']), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
      },
    });
    res.status(200).json(updatedSession);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete a Session (Only the session, not the projects)
app.delete('/sessions/:id', authMiddleware(['EQUIPE_TTM']), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    // Check if the session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Delete the session
    await prisma.session.delete({
      where: { id: sessionId },
    });

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete session' });
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





app.get('/sessions', authMiddleware(['EQUIPE_TTM', 'PMO_DIRECTION']), async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        projects: {
          orderBy: {
            startDate: 'asc', // Order projects by startDate in ascending order
          },
        },
      },
    });

    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
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

// Insert Projects into a Session
app.post('/sessions/:id/projects', authMiddleware(['EQUIPE_TTM']), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { projectIds } = req.body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: 'Project IDs are required and must be an array' });
    }

    // Check if the session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update the projects to associate them with the session
    const updatedProjects = await Promise.all(
      projectIds.map((projectId) =>
        prisma.project.update({
          where: { id: projectId },
          data: { sessionId },
        })
      )
    );

    res.status(200).json({
      message: 'Projects successfully added to the session',
      sessionId,
      projects: updatedProjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add projects to the session' });
  }
});


// Import Projects by Date and Include in Session
app.post('/session/by-date', authMiddleware(['EQUIPE_TTM']), async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Parse the provided date and calculate the start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch projects scheduled within the same day
    const projects = await prisma.project.findMany({
      where: {
        startDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (projects.length === 0) {
      return res.status(404).json({ error: 'No projects found for the given date' });
    }

    // Check if a session already exists for the given date
    let session = await prisma.session.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!session) {
      // Create a new session if none exists
      session = await prisma.session.create({
        data: {
          date: new Date(startOfDay),
          ...req.body, // Include other session data if needed
        },
      });
    }

    // Update all projects to include them in the session
    const updatedProjects = await Promise.all(
      projects.map((project) =>
        prisma.project.update({
          where: { id: project.id },
          data: { sessionId: session.id },
        })
      )
    );

    res.status(200).json({
      message: 'Projects successfully included in the session',
      session,
      projects: updatedProjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process projects by date' });
  }
});

// Remove a Project from a Session
app.delete('/sessions/:sessionId/projects/:projectId', authMiddleware(['EQUIPE_TTM']), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const projectId = parseInt(req.params.projectId);

    // Check if the session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if the project exists and is associated with the session
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.sessionId !== sessionId) {
      return res.status(404).json({ error: 'Project not found in the specified session' });
    }

    // Remove the project from the session by setting `sessionId` to `null`
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { sessionId: null },
    });

    res.status(200).json({
      message: 'Project successfully removed from the session',
      project: updatedProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove project from the session' });
  }
});

// Delete a Project by ID
app.delete('/project/:id', authMiddleware(['CHEF_DE_PROJET', 'EQUIPE_TTM', 'PMO_DIRECTION']), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    // Check if the project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete the project
    await prisma.project.delete({
      where: { id: projectId },
    });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.post('/sessions/:sessionId/schedule', authMiddleware(['EQUIPE_TTM']), async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    // Check if the session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        projects: true, // Include all projects in the session
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update all projects in the session to the state "SCHEDULED"
    const updatedProjects = await Promise.all(
      session.projects.map(async (project) => {
        // Update the project state to "SCHEDULED"
        const updatedProject = await prisma.project.update({
          where: { id: project.id },
          data: { state: 'SCHEDULED' },
        });

        // Create a decision for the project
        console.log('Creating decision for project ID:', project.id);
        const decision = await prisma.decision.create({
          data: {
            decision: 'NO_GO', // Default decision
            project: { connect: { id: project.id } },
          },
        });

        return { updatedProject, decision };
      })
    );

    res.status(200).json({
      message: 'All projects in the session have been scheduled and decisions created',
      sessionId,
      updatedProjects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to schedule projects in the session' });
  }
});

// List all decisions with role-based filtering
app.get('/decisions', authMiddleware(['EQUIPE_TTM', 'PMO_DIRECTION', 'CHEF_DE_PROJET']), async (req, res) => {
  try {
    let decisions;

    // Handle logic based on user role
    if (req.user.role === 'CHEF_DE_PROJET') {
      // Show only decisions for projects created by the user
      decisions = await prisma.decision.findMany({
        where: {
          project: {
            createdById: req.user.id,
          },
        },
        include: {
          project: true, // Include associated project details if needed
        },
      });
    } else if (req.user.role === 'PMO_DIRECTION') {
      // Show all decisions for projects in the user's direction
      decisions = await prisma.decision.findMany({
        where: {
          project: {
            direction: req.user.direction,
          },
        },
        include: {
          project: true, // Include associated project details if needed
        },
      });
    } else {
      // EQUIPE_TTM or other roles can see all decisions
      decisions = await prisma.decision.findMany({
        include: {
          project: true, // Include associated project details if needed
        },
      });
    }

    res.status(200).json(decisions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch decisions' });
  }
});

// Update a decision by ID
app.put('/decisions/:id', authMiddleware(['EQUIPE_TTM', 'PMO_DIRECTION']), async (req, res) => {
  try {
    const decisionId = parseInt(req.params.id);
    const { decision, comments, action } = req.body;

    // Check if the decision exists
    const existingDecision = await prisma.decision.findUnique({
      where: { id: decisionId },
    });

    if (!existingDecision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    // Update the decision
    const updatedDecision = await prisma.decision.update({
      where: { id: decisionId },
      data: { decision, comments, action },
    });

    res.status(200).json(updatedDecision);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

// Delete a decision by ID
app.delete('/decisions/:id', authMiddleware(['EQUIPE_TTM', 'PMO_DIRECTION']), async (req, res) => {
  try {
    const decisionId = parseInt(req.params.id);

    // Check if the decision exists
    const existingDecision = await prisma.decision.findUnique({
      where: { id: decisionId },
    });

    if (!existingDecision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    // Delete the decision
    await prisma.decision.delete({
      where: { id: decisionId },
    });

    res.status(200).json({ message: 'Decision deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete decision' });
  }
});

app.get('/dashboard', authMiddleware(['PMO_DIRECTION', 'EQUIPE_TTM', 'CHEF_DE_PROJET']), async (req, res) => {
  try {
    const now = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);

    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(now.getMonth() - 4);

    // Total projects
    const totalProjects = await prisma.project.count();

    // Projects created in the last two months
    const projectsLastTwoMonths = await prisma.project.count({
      where: {
        createdAt: {
          gte: twoMonthsAgo,
        },
      },
    });

    // Projects created in the two months before the last two months
    const projectsTwoMonthsBeforeLast = await prisma.project.count({
      where: {
        createdAt: {
          gte: fourMonthsAgo,
          lt: twoMonthsAgo,
        },
      },
    });

    // Percentage change in projects created
    const projectCreationRate =
      projectsTwoMonthsBeforeLast === 0
        ? 100
        : ((projectsLastTwoMonths - projectsTwoMonthsBeforeLast) / projectsTwoMonthsBeforeLast) * 100;

    // Validated projects (SCHEDULED)
    const validatedProjectsLastTwoMonths = await prisma.project.count({
      where: {
        state: 'SCHEDULED',
        createdAt: {
          gte: twoMonthsAgo,
        },
      },
    });

    const validatedProjectsTwoMonthsBeforeLast = await prisma.project.count({
      where: {
        state: 'SCHEDULED',
        createdAt: {
          gte: fourMonthsAgo,
          lt: twoMonthsAgo,
        },
      },
    });

    const validatedProjectsRate =
      validatedProjectsTwoMonthsBeforeLast === 0
        ? 100
        : ((validatedProjectsLastTwoMonths - validatedProjectsTwoMonthsBeforeLast) /
            validatedProjectsTwoMonthsBeforeLast) *
          100;

    // Projects under validation (PMO_VALIDATION or TTM_VALIDATION)
    const underValidationProjectsLastTwoMonths = await prisma.project.count({
      where: {
        state: {
          in: ['PMO_VALIDATION', 'TTM_VALIDATION'],
        },
        createdAt: {
          gte: twoMonthsAgo,
        },
      },
    });

    const underValidationProjectsTwoMonthsBeforeLast = await prisma.project.count({
      where: {
        state: {
          in: ['PMO_VALIDATION', 'TTM_VALIDATION'],
        },
        createdAt: {
          gte: fourMonthsAgo,
          lt: twoMonthsAgo,
        },
      },
    });

    const underValidationProjectsRate =
      underValidationProjectsTwoMonthsBeforeLast === 0
        ? 100
        : ((underValidationProjectsLastTwoMonths - underValidationProjectsTwoMonthsBeforeLast) /
            underValidationProjectsTwoMonthsBeforeLast) *
          100;

    res.status(200).json({
      totalProjects,
      projectCreationRate: projectCreationRate.toFixed(2),
      validatedProjects: validatedProjectsLastTwoMonths,
      validatedProjectsRate: validatedProjectsRate.toFixed(2),
      underValidationProjects: underValidationProjectsLastTwoMonths,
      underValidationProjectsRate: underValidationProjectsRate.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});
app.get('/dashboard/comparison', authMiddleware(['PMO_DIRECTION', 'EQUIPE_TTM', 'CHEF_DE_PROJET']), async (req, res) => {
  try {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    // Helper function to get the start and end of a week
    const getWeekRange = (date) => {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay()); // Set to Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
      endOfWeek.setHours(23, 59, 59, 999);

      return { startOfWeek, endOfWeek };
    };

    // Calculate weekly statistics for the past month
    const weeklyStats = [];
    let currentDate = new Date(oneMonthAgo);

    while (currentDate <= now) {
      const { startOfWeek, endOfWeek } = getWeekRange(currentDate);

      // Count validated projects (SCHEDULED) for the week
      const validatedProjects = await prisma.project.count({
        where: {
          state: 'SCHEDULED',
          createdAt: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      });

      // Count non-validated projects (not SCHEDULED) for the week
      const nonValidatedProjects = await prisma.project.count({
        where: {
          state: { not: 'SCHEDULED' },
          createdAt: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      });

      weeklyStats.push({
        week: `${startOfWeek.toISOString().split('T')[0]} to ${endOfWeek.toISOString().split('T')[0]}`,
        validatedProjects,
        nonValidatedProjects,
      });

      // Move to the next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    res.status(200).json(weeklyStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch weekly comparison data' });
  }
});
app.get('/projects-by-type', authMiddleware(['PMO_DIRECTION', 'EQUIPE_TTM', 'CHEF_DE_PROJET']), async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st of the current year
    const endOfJune = new Date(now.getFullYear(), 5, 30, 23, 59, 59, 999); // June 30th of the current year

    // Helper function to get the start and end of a month
    const getMonthRange = (year, month) => {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of the month
      return { startOfMonth, endOfMonth };
    };

    const series = [
      { name: 'COMOP', data: [] },
      { name: 'CI', data: [] },
    ];

    // Loop through each month from January to June
    for (let month = 0; month < 6; month++) {
      const { startOfMonth, endOfMonth } = getMonthRange(now.getFullYear(), month);

      // Count projects with ProjectType COMOP for the month
      const comopCount = await prisma.project.count({
        where: {
          type: 'COMOP',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // Count projects with ProjectType CI for the month
      const ciCount = await prisma.project.count({
        where: {
          type: 'CI',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // Add the counts to the series data
      series[0].data.push(comopCount); // COMOP
      series[1].data.push(ciCount);   // CI
    }

    res.status(200).json(series);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project data by type' });
  }
});
app.get('/projects-by-jalon', authMiddleware(['PMO_DIRECTION', 'EQUIPE_TTM', 'CHEF_DE_PROJET']), async (req, res) => {
  try {
    const jalons = ['T-1', 'T0', 'T1', 'T2', 'T3', 'T4'];
    const counts = [];

    for (const jalon of jalons) {
      // Count projects for each jalonTTM
      const count = await prisma.project.count({
        where: {
          jalonTTM: jalon,
        },
      });

      counts.push(count); // Add the count to the array
    }

    res.status(200).json(counts); // Return the array of counts
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects by jalonTTM' });
  }
});
app.listen(5001, () => console.log('Server running on port 5001'));