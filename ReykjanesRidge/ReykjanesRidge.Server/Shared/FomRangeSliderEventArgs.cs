namespace ReykjanesRidge.Server.Shared
{
    public class FomRangeSliderEventArgs : EventArgs
    {
        public double Range { get; set; }
        public double FirstValue { get; set; }
        public double SecondValue { get; set; }
    }
}
