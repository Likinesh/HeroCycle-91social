## Questions & Pseudocode

1. **What should I do when a part is discontinued?**
   If a part is discontinued but already used in several configurations, deleting it would break those existing configurations as well. To prevent that I used soft deletes using an `isActive` flag. Discontinued parts are just marked inactive, so historical data remains safe.

2. **Who is accessible to edit the prices?**
   I used role-based access. Only "Admin" users can edit parts, categories, and prices. Sales users can only view this data to build configurations.

3. **If prices change, how should it affect existing configurations?**
   If a configuration's price was frozen at creation, the sales team would still be giving outdated quotes. Therefore, configurations dynamically fetch the live price of parts whenever viewed, ensuring the total price is always up-to-date.

4. **What are the minimum requirements to create a cycle?**
   A cycle needs specific parts to be valid like you can't build a cycle without a frame or tyres. I used Categories system where categories can be marked as `isRequired` with a `requiredQuantity`. This makes it necessary that every configuration must have atleast 1 frame and 2 tyres or as required.

5. **How to authenticate and authorize users?**
   To keep the system secure but simple to use, I implemented JWT (JSON Web Tokens) stored in HTTP-only cookies. This automatically authenticates users on every request, and middleware checks their role to authorize actions.

6. **How do we ensure the pricing engine is easy to use for non-technical sales staff?**
   I used an interactive "Command Center" dashboard with clear modals, instant calculations, and a standardized UI so sales reps can build a configuration in seconds without navigating away from the page.

## Assumptions

1. **Sales team requires only updated live prices:** The sales team need what it costs *today* to build that cycle not previous prices.
2. **Configurations require specific quantities of parts:** A cycle configuration must have atleast some physical parts (Eg. exactly 1 frame, exactly 2 tyres) to be considered complete.
3. **Configuration cost is Base Price + Parts:** The total cost of a cycle is a base price plus the sum of all the individual parts attached to it.
4. **Prices are stored in paise for easy calculation:** JavaScript floating-point math can cause errors. So, all prices are stored as whole integers (paise) in the database and only converted to Rupees to display.
5. **Only active parts are used in new builds:** When creating new configuration, only parts with `isActive: true` are available to be selected in the dropdown.

## Pseudocode — Dynamic Pricing Calculation

This logic runs whenever a salesperson views a cycle configuration. It reads the cycle blueprint and calculates the live price step-by-step in a way that is easy to understand.

```text
Function Get_Configuration_Price_Details(Configuration_ID):
    
    // Step 1: Find the configuration blueprint in the database
    Blueprint = Database.Find_Configuration(Configuration_ID)
    
    // Step 2: Start the total price with the blueprint's base price
    Total_Price = Blueprint.Base_Price
    Receipt_Breakdown = []
    
    // Step 3: Loop through every part needed for this blueprint
    For Every Linked_Part in Blueprint.Parts:
        
        // Fetch the CURRENT LIVE price of the part from the database
        Live_Part_Details = Database.Find_Part(Linked_Part.ID)
        
        // Calculate the subtotal (Live Price multiplied by Quantity needed)
        Subtotal = Live_Part_Details.Current_Price * Linked_Part.Quantity
        
        // Add this subtotal to our running total
        Total_Price = Total_Price + Subtotal
        
        // Add this line item to our receipt breakdown
        Receipt_Breakdown.Add({
            Part_Name: Live_Part_Details.Name,
            Unit_Price: Live_Part_Details.Current_Price,
            Quantity: Linked_Part.Quantity,
            Line_Total: Subtotal
        })
        
    // Step 4: Return the finalized receipt to the user
    Return {
        Configuration_Name: Blueprint.Name,
        Base_Price: Blueprint.Base_Price,
        Final_Total_Price: Total_Price,
        Detailed_Breakdown: Receipt_Breakdown
    }
```

The key design choice in my project is that we don't store the total price but it's calculated fresh every time to make it accurate.