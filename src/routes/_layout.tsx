import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '../components/layout/AdminLayout';

export const Route = createFileRoute('/_layout')({
  component: AdminLayout,
});
