namespace ReykjanesRidge.Server.Shared
{
    public class FomRangeSliderEventArgs : EventArgs
    {
        public decimal Range { get; set; }
        public decimal FirstValue { get; set; }
        public decimal SecondValue { get; set; }
    }
}
