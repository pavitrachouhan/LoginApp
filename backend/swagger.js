const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Employee Management & Leave Workflow API",
      version: "1.0.0",
      description: "API documentation for the Employee Management System with leave approval workflow.",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    password: { type: "string" },
                    role: { type: "string", example: "employee" },
                  },
                  required: ["username", "password"],
                },
              },
            },
          },
          responses: {
            201: { description: "User created" },
            400: { description: "Invalid input" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and receive JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    password: { type: "string" },
                  },
                  required: ["username", "password"],
                },
              },
            },
          },
          responses: {
            200: { description: "Successful login" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/api/leaves/apply": {
        post: {
          tags: ["Leave"],
          summary: "Apply for leave",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    leave_type_id: { type: "integer" },
                    from_date: { type: "string", format: "date" },
                    to_date: { type: "string", format: "date" },
                    total_days: { type: "integer" },
                    reason: { type: "string" },
                  },
                  required: ["leave_type_id", "from_date", "to_date", "total_days"],
                },
              },
            },
          },
          responses: {
            201: { description: "Leave applied successfully" },
            400: { description: "Validation error" },
          },
        },
      },
      "/api/leaves": {
        get: {
          tags: ["Leave"],
          summary: "List leave applications for the current user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "List of leave applications" },
          },
        },
      },
      "/api/leaves/{id}/manager": {
        put: {
          tags: ["Leave"],
          summary: "Manager approve or reject a leave request",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    action: { type: "string", enum: ["APPROVE", "REJECT"] },
                    comment: { type: "string" },
                  },
                  required: ["action"],
                },
              },
            },
          },
          responses: {
            200: { description: "Review outcome" },
          },
        },
      },
      "/api/leaves/{id}/hr": {
        put: {
          tags: ["Leave"],
          summary: "HR finalize leave approval",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    action: { type: "string", enum: ["APPROVE", "REJECT"] },
                    comment: { type: "string" },
                  },
                  required: ["action"],
                },
              },
            },
          },
          responses: {
            200: { description: "Review outcome" },
          },
        },
      },
      "/api/reports/leave-summary": {
        get: {
          tags: ["Reports"],
          summary: "Leave dashboard summary",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Leave summary metrics" },
          },
        },
      },
      "/api/reports/employees": {
        get: {
          tags: ["Reports"],
          summary: "Employee report with filtering and pagination",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer" } },
            { name: "offset", in: "query", schema: { type: "integer" } },
            { name: "sortBy", in: "query", schema: { type: "string" } },
            { name: "order", in: "query", schema: { type: "string", enum: ["ASC", "DESC"] } },
          ],
          responses: {
            200: { description: "Employee report data" },
          },
        },
      },
      "/api/reports/leaves": {
        get: {
          tags: ["Reports"],
          summary: "Leave application report",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer" } },
            { name: "offset", in: "query", schema: { type: "integer" } },
            { name: "sortBy", in: "query", schema: { type: "string" } },
            { name: "order", in: "query", schema: { type: "string", enum: ["ASC", "DESC"] } },
          ],
          responses: {
            200: { description: "Leave report data" },
          },
        },
      },
      "/api/reports/department-analytics": {
        get: {
          tags: ["Reports"],
          summary: "Department-wise analytics summary",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Department analytics" },
          },
        },
      },
      "/api/reports/export/employees": {
        get: {
          tags: ["Reports"],
          summary: "Export employee report to CSV",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "CSV file response" },
          },
        },
      },
      "/api/reports/export/leaves": {
        get: {
          tags: ["Reports"],
          summary: "Export leave report to CSV",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "CSV file response" },
          },
        },
      },
      "/api/reports/export/assets": {
        get: {
          tags: ["Reports"],
          summary: "Export asset report to CSV",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "CSV file response" },
          },
        },
      },
      "/api/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "List notifications for the authenticated user",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer" } },
            { name: "offset", in: "query", schema: { type: "integer" } },
            { name: "unread", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          ],
          responses: {
            200: { description: "Notifications list" },
          },
        },
      },
      "/api/notifications/{id}/read": {
        put: {
          tags: ["Notifications"],
          summary: "Mark a notification as read",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "Notification marked as read" },
          },
        },
      },
      "/api/audits": {
        get: {
          tags: ["Audit"],
          summary: "Read audit trail entries",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "table_name", in: "query", schema: { type: "string" } },
            { name: "action", in: "query", schema: { type: "string" } },
            { name: "limit", in: "query", schema: { type: "integer" } },
            { name: "offset", in: "query", schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Audit log entries" },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsDoc(options);
