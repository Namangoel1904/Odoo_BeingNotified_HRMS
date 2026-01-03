from decimal import Decimal, ROUND_HALF_UP

class SalaryService:
    @staticmethod
    def calculate_salary_structure(wage: float, basic_percent: float = 50.0):
        """
        Calculate salary components based on strict rules.
        """
        wage_dec = Decimal(str(wage)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        basic_pct_dec = Decimal(str(basic_percent)) / 100
        
        # 1. Basic
        basic = (wage_dec * basic_pct_dec).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # 2. HRA (50% of Basic)
        hra = (basic * Decimal("0.5")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # 3. Standard Allowance (Fixed)
        std_allowance = Decimal("4167.00")

        # 4. Performance Bonus (8.33% of Basic)
        perf_bonus = (basic * Decimal("0.0833")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # 5. LTA (8.33% of Basic)
        lta = (basic * Decimal("0.0833")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # 6. Fixed Allowance (Residual)
        # Wage = Basic + HRA + SA + Perf + LTA + Fixed
        total_alloc = basic + hra + std_allowance + perf_bonus + lta
        fixed_allowance = wage_dec - total_alloc

        if fixed_allowance < 0:
            # Adjust? Or raise error?
            # User rule: "Fixed Allowance MUST NEVER be negative."
            # If wage is too low, this structure fails.
            # But usually for low wages, std allowance/basic might adjust. 
            # For this strict requirement, we'll set to 0 and throw error if strictly enforced,
            # or ideally we assume Input Wage is sufficient.
            # Let's return 0 but logic implies wage must cover components.
            # For now, we will raise an error or set to 0? 
            # Rule 2: MUST NEVER be negative.
            if fixed_allowance < 0:
                 raise ValueError("Wage is too low to cover standard components")
        
        # 7. Deductions
        # PF 12% of Basic
        pf = (basic * Decimal("0.12")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        prof_tax = Decimal("200.00")

        return {
            "wage": wage_dec,
            "basic_component": basic,
            "hra_component": hra,
            "standard_allowance": std_allowance,
            "performance_bonus": perf_bonus,
            "leave_travel_allowance": lta,
            "fixed_allowance": fixed_allowance,
            "pf_employee_amount": pf,
            "pf_employer_amount": pf,
            "professional_tax": prof_tax,
            "net_salary": wage_dec - pf - prof_tax # Simplified Net
        }
