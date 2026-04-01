import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all inadimplentes
app.get('/api/inadimplentes', async (req, res) => {
  try {
    const list = await prisma.inadimplente.findMany({
      orderBy: { dataVencimento: 'asc' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar inadimplentes' });
  }
});

// Create new record
app.post('/api/inadimplentes', async (req, res) => {
  const { nome, documento, valor, dataVencimento, status } = req.body;
  try {
    const newItem = await prisma.inadimplente.create({
      data: {
        nome,
        documento,
        valor: parseFloat(valor),
        dataVencimento: new Date(dataVencimento),
        status
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar registro' });
  }
});

// Update record
app.put('/api/inadimplentes/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, documento, valor, dataVencimento, status } = req.body;
  try {
    const updatedItem = await prisma.inadimplente.update({
      where: { id },
      data: {
        nome,
        documento,
        valor: parseFloat(valor),
        dataVencimento: new Date(dataVencimento),
        status
      }
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar registro' });
  }
});

// Delete record
app.delete('/api/inadimplentes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.inadimplente.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir registro' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
