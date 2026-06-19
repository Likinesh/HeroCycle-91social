# Prompts Used

These are the main prompts I used are:

**1. Initial database schema design**

> "I need to build a db schema for pricing engine for a bicycle manufacturer. Prices change frequently. Sales reps need to see dynamic prices for cycle configurations. Design a database schema using Prisma needs Users for roles(admin, salesperson), Categories for part types, Parts with prices and active flags(soft deletes), and Configurations that link to multiple parts."

**2. Prisma setup and schema generation**

> "Initialize Prisma in the backend folder and generate the schema file based on the DB design given. Create models for User, Category, Part, Configuration, and ConfigurationPart with the right relations and field types. Prices as Int since we're storing in paise."

**3. Price calculation logic**

> "Write the logic to calculate a configuration's total price dynamically. The price is base price plus current price of each attached part times its quantity. Return the breakdown per component so the frontend can show a receipt-style view to sales users."

**4. Frontend pages**

> "Build a Next.js frontend with a dashboard that shows stats, a parts management page, categories page, and configurations page. Each page needs CRUD modals. Show prices in INR format for feasibility."

**5. UI cleanup with shadcn**

> "Replace the custom Button, Modal, Table, Badge components with shadcn/ui equivalents. Use Dialog instead of Modal, shadcn Table for all tables, and shadcn Badge for status indicators."

**6. Reducing code repetition**

> "For all pages since code is too large make reusable components so the code prevents repetitions."

**7. Seed data for testing**

> "Add a seed script that creates a default admin user and a sales user, some sample categories like Frames, Tyres, Gear Sets, and a few parts under each category with realistic prices. So anyone cloning the repo can just run prisma db seed and start testing."

**8. Configuration validation**

> "When creating a configuration, pre-populate the form with required categories so users know they need to pick a frame and tyres. Let them add optional parts on top. Validate that at least one part is selected before saving."

**9. Price breakdown modal**

> "Add a 'View Breakdown' button on each configuration row. Clicking it should open a modal that shows base price, then each part with unit price × quantity = subtotal, and the grand total at the bottom."

**10. Color fixes**

> "Check for colors matching since the text becomes invisible in some places. The text-muted class is now a background color after shadcn init, need to fix it to text-muted-foreground everywhere."

**11. Sidebar navigation**

> "Change the top navbar to a sidebar layout. Move nav links and user info into a vertical sidebar on the left side."

**12. Final review**

> "Go through the whole app and check if everything from the problem statement is covered. Look for any issues, missing features, or things left behind that might break the flow."
