const c = require("ansi-colors")

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    // TODO: we need a good doc to point this to
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
]

function checkEnvVariables() {
  // Check if we're in a Docker build environment
  const isDockerBuild =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ===
      "docker-build-placeholder" || process.env.DOCKER_BUILD === "true"

  const missingEnvs = requiredEnvs.filter(function (env) {
    const value = process.env[env.key]
    // Check if value is missing or empty (but not the placeholder)
    return (
      !value ||
      (value.trim && value.trim() === "") ||
      value === "docker-build-placeholder"
    )
  })

  if (missingEnvs.length > 0) {
    if (isDockerBuild) {
      // During Docker builds, show warning but don't fail
      console.warn(
        c.yellow.bold(
          "\n⚠️  Warning: Missing required environment variables during Docker build\n"
        )
      )
      missingEnvs.forEach(function (env) {
        console.warn(c.yellow(`  ${c.bold(env.key)}`))
        if (env.description) {
          console.warn(c.dim(`    ${env.description}\n`))
        }
      })
      console.warn(
        c.yellow(
          "⚠️  Build will continue, but you MUST set the actual values in docker-compose.yml or .env file before production use.\n"
        )
      )
      // Don't exit - allow build to continue
      return
    } else {
      // In local development, fail if missing
      console.error(
        c.red.bold("\n🚫 Error: Missing required environment variables\n")
      )
      missingEnvs.forEach(function (env) {
        console.error(c.yellow(`  ${c.bold(env.key)}`))
        if (env.description) {
          console.error(c.dim(`    ${env.description}\n`))
        }
      })
      console.error(
        c.yellow(
          "\nPlease set these variables in your .env file or environment before starting the application.\n"
        )
      )
      process.exit(1)
    }
  }
}

module.exports = checkEnvVariables
