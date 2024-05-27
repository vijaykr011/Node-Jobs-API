const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
  //we are looking for jobs that is associated with this user
  const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
  const {
    user: { userId }, //req.user.userId: This is assuming that the user information has been added to the req object through middleware, such as an authentication middleware that verifies the user's token and extracts their user ID.
    params: { id: jobId }, //req.params.id: This extracts the id parameter from the route, which represents the ID of the job we want to fetch.
  } = req;

  const job = await Job.findOne({ _id: jobId, createdBy: userId }); //This query attempts to find a job in the database where the job's _id matches jobId and the createdBy field matches userId. This ensures that the job belongs to the user making the request

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;
  if (company === "" || position === "") {
    throw new BadRequestError("Company or Positions fields cannot be empty");
  }
  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true } //{new:true} ensures that the method returns the updated document rather than the original document. By default, Mongoose only runs validators on create and save operations, not on update operations. Setting { runValidators: true } ensures that the schema's validation rules are applied during the update, helping to maintain data integrity.
  );
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await findByIdAndDelete({ _id: jobId, createdBy: userId });
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

module.exports = { getAllJobs, getJob, createJob, updateJob, deleteJob };
