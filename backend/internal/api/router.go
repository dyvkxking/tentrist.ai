// Package api provides the HTTP API server for Tentrist.
package api

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/tentrist.ai/backend/internal/api/handlers"
)

// Router wraps the Gorilla mux router with Tentrist API routes.
type Router struct {
	mux    *mux.Router
	job    *handlers.JobHandler
	node   *handlers.NodeHandler
}

// NewRouter creates a new API router with all routes configured.
func NewRouter() *Router {
	r := &Router{
		mux:  mux.NewRouter(),
		job:  handlers.NewJobHandler(),
		node: handlers.NewNodeHandler(),
	}

	r.setupRoutes()
	return r
}

func (r *Router) setupRoutes() {
	// Health check
	r.mux.HandleFunc("/health", func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods(http.MethodGet)

	// Job routes
	jobRouter := r.mux.PathPrefix("/api/v1").Subrouter()
	r.job.ServeJobs(jobRouter)

	// Node routes
	nodeRouter := r.mux.PathPrefix("/api/v1").Subrouter()
	r.node.ServeNodes(nodeRouter)
}

// ServeHTTP implements http.Handler.
func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	r.mux.ServeHTTP(w, req)
}

// Mux returns the underlying mux router for testing.
func (r *Router) Mux() *mux.Router {
	return r.mux
}

// JobHandler returns the job handler instance.
func (r *Router) JobHandler() *handlers.JobHandler {
	return r.job
}

// NodeHandler returns the node handler instance.
func (r *Router) NodeHandler() *handlers.NodeHandler {
	return r.node
}
