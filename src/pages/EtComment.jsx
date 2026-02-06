import React from 'react';
import { Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Cette page a été supprimée - redirection vers Welcome
export default function EtComment() {
  return <Navigate to={createPageUrl('Welcome')} replace />;
}