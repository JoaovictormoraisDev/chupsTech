const { handleActivities, handleDashboard } = require("../controllers/activityController");

function apiRouter(req, res, pathname) {
  if (pathname === "/api/dashboard") {
    handleDashboard(req, res);
    return true;
  }

  if (pathname === "/api/activities") {
    handleActivities(req, res);
    return true;
  }

  if (pathname.startsWith("/api/activities/")) {
    const id = decodeURIComponent(pathname.replace("/api/activities/", ""));
    handleActivities(req, res, id);
    return true;
  }

  return false;
}

module.exports = apiRouter;

